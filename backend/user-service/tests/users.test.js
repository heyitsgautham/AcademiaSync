const request = require('supertest');
const { app, pool } = require('../src/index');
const { createFixtures, authHeader } = require('./helpers/fixtures');

const db = createFixtures(pool);

describe('profile and dashboard routes', () => {
    let student;
    let teacher;

    beforeEach(async () => {
        await db.resetDatabase();
        student = await db.createUser('Student', { first_name: 'Sam', age: 21 });
        teacher = await db.createUser('Teacher', { specialization: 'History' });
    });

    afterAll(() => pool.end());

    it('returns the caller profile', async () => {
        const res = await request(app).get('/api/users/profile').set(authHeader(student));

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ id: student.id, role: 'Student', first_name: 'Sam', age: 21 });
    });

    it('returns 404 for a token whose user was deleted', async () => {
        await pool.query('DELETE FROM users WHERE id = $1', [student.id]);
        const res = await request(app).get('/api/users/profile').set(authHeader(student));
        expect(res.status).toBe(404);
    });

    it('updates the profile', async () => {
        const res = await request(app)
            .put('/api/users/profile')
            .set(authHeader(teacher))
            .send({ first_name: 'Hana', last_name: 'Lee', age: 40, specialization: 'Modern History' });

        expect(res.status).toBe(200);
        expect(res.body.user).toMatchObject({ first_name: 'Hana', age: 40, specialization: 'Modern History' });
    });

    it.each([
        [{ last_name: 'x' }, 'First name is required'],
        [{ first_name: 'x', age: 12 }, 'Age must be between 18 and 100'],
        [{ first_name: 'x', age: 101 }, 'Age must be between 18 and 100'],
    ])('rejects %j', async (body, message) => {
        const res = await request(app).put('/api/users/profile').set(authHeader(student)).send(body);
        expect(res.status).toBe(400);
        expect(res.body.message).toBe(message);
    });

    it('routes each role to its own dashboard', async () => {
        const studentRes = await request(app).get('/student/dashboard').set(authHeader(student));
        expect(studentRes.status).toBe(200);
        expect(studentRes.body.role).toBe('student');

        const teacherRes = await request(app).get('/teacher/dashboard').set(authHeader(teacher));
        expect(teacherRes.status).toBe(200);
        expect(teacherRes.body.user.id).toBe(teacher.id);

        expect((await request(app).get('/teacher/dashboard').set(authHeader(student))).status).toBe(403);
        expect((await request(app).get('/student/dashboard').set(authHeader(teacher))).status).toBe(403);
    });

    it('rejects an expired access token', async () => {
        const jwt = require('jsonwebtoken');
        const expired = jwt.sign({ id: student.id, role: 'Student' }, process.env.JWT_SECRET, { expiresIn: -10 });
        const res = await request(app).get('/api/users/profile').set('Authorization', `Bearer ${expired}`);
        expect(res.status).toBe(401);
    });
});
