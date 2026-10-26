const request = require('supertest');
const bcrypt = require('bcryptjs');
const { app, pool } = require('../src/index');
const { createFixtures, authHeader } = require('./helpers/fixtures');

const db = createFixtures(pool);

describe('admin student management', () => {
    let admin;
    let teacher;
    let student;

    beforeEach(async () => {
        await db.resetDatabase();
        admin = await db.createUser('Admin');
        teacher = await db.createUser('Teacher');
        student = await db.createUser('Student', { first_name: 'Sue', last_name: 'Student', age: 20 });
    });

    afterAll(() => pool.end());

    describe('POST /admin/students', () => {
        const body = { firstName: 'Nia', lastName: 'New', email: 'nia@example.com', age: 19, password: 'secret12' };

        it('creates a student with a hashed password', async () => {
            const res = await request(app).post('/admin/students').set(authHeader(admin)).send(body);

            expect(res.status).toBe(201);
            expect(res.body).toMatchObject({
                firstName: 'Nia',
                lastName: 'New',
                email: 'nia@example.com',
                age: 19,
                role: 'Student',
            });
            const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [res.body.id]);
            expect(rows[0].password_hash).not.toBe('secret12');
            expect(await bcrypt.compare('secret12', rows[0].password_hash)).toBe(true);
        });

        it('answers 409 for an email that is already registered', async () => {
            const res = await request(app)
                .post('/admin/students')
                .set(authHeader(admin))
                .send({ ...body, email: student.email });

            expect(res.status).toBe(409);
            expect(res.body.error).toBe('Email already exists');
        });

        it.each([
            [{ ...body, password: undefined }, 'Password is required for new students'],
            [{ ...body, password: '123' }, 'Password must be at least 6 characters'],
            [{ ...body, email: 'not-an-email' }, 'Email must be a valid address'],
            [{ ...body, age: 7 }, 'Age must be between 10 and 100'],
            [{ ...body, firstName: '' }, 'First name, last name and email are required'],
        ])('rejects %j', async (input, message) => {
            const res = await request(app).post('/admin/students').set(authHeader(admin)).send(input);
            expect(res.status).toBe(400);
            expect(JSON.stringify(res.body)).toContain(message);
        });

        it('is for admins only', async () => {
            const res = await request(app).post('/admin/students').set(authHeader(teacher)).send(body);
            expect(res.status).toBe(403);
        });
    });

    describe('PUT /admin/students/:id', () => {
        it('updates name, email and age', async () => {
            const res = await request(app)
                .put(`/admin/students/${student.id}`)
                .set(authHeader(admin))
                .send({ firstName: 'Susan', lastName: 'Smith', email: 'susan@example.com', age: '' });

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({
                id: student.id,
                firstName: 'Susan',
                email: 'susan@example.com',
                age: null,
            });
        });

        it('answers 404 for a user who is not a student', async () => {
            const res = await request(app)
                .put(`/admin/students/${teacher.id}`)
                .set(authHeader(admin))
                .send({ firstName: 'X', lastName: 'Y', email: 'x@example.com' });

            expect(res.status).toBe(404);
        });

        it("answers 409 when the new email is someone else's", async () => {
            const res = await request(app)
                .put(`/admin/students/${student.id}`)
                .set(authHeader(admin))
                .send({ firstName: 'Sue', lastName: 'Student', email: teacher.email });

            expect(res.status).toBe(409);
        });
    });

    describe('DELETE /admin/students/:id', () => {
        it('deletes the student', async () => {
            const res = await request(app).delete(`/admin/students/${student.id}`).set(authHeader(admin));

            expect(res.status).toBe(200);
            const { rows } = await pool.query('SELECT id FROM users WHERE id = $1', [student.id]);
            expect(rows).toHaveLength(0);
        });

        it('will not delete a teacher through the student route', async () => {
            const res = await request(app).delete(`/admin/students/${teacher.id}`).set(authHeader(admin));
            expect(res.status).toBe(404);
        });
    });

    describe('POST /admin/change-role', () => {
        it('demotes a teacher without courses to student', async () => {
            const res = await request(app)
                .post('/admin/change-role')
                .set(authHeader(admin))
                .send({ userId: teacher.id, newRole: 'Student' });

            expect(res.status).toBe(200);
            expect(res.body.user.role).toBe('Student');
        });

        it('refuses to demote a teacher who still owns a course', async () => {
            await db.createCourse(teacher.id);
            const res = await request(app)
                .post('/admin/change-role')
                .set(authHeader(admin))
                .send({ userId: teacher.id, newRole: 'Student' });

            expect(res.status).toBe(409);
        });

        it("refuses to change the caller's own role", async () => {
            const res = await request(app)
                .post('/admin/change-role')
                .set(authHeader(admin))
                .send({ userId: admin.id, newRole: 'Student' });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('You cannot change your own role');
        });

        it('rejects an unknown role', async () => {
            const res = await request(app)
                .post('/admin/change-role')
                .set(authHeader(admin))
                .send({ userId: teacher.id, newRole: 'Owner' });

            expect(res.status).toBe(400);
        });
    });
});
