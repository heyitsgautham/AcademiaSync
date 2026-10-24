const request = require('supertest');
const { app, pool } = require('../src/index');
const { createFixtures, authHeader } = require('./helpers/fixtures');

const db = createFixtures(pool);

describe('teacher course routes', () => {
    let teacher;
    let otherTeacher;

    beforeEach(async () => {
        await db.resetDatabase();
        teacher = await db.createUser('Teacher');
        otherTeacher = await db.createUser('Teacher');
    });

    afterAll(() => pool.end());

    describe('GET /api/teacher/courses', () => {
        it('lists only the teacher courses, newest first, with enrollment counts', async () => {
            const older = await db.createCourse(teacher.id, { title: 'Older', created_at: '2025-01-01' });
            const newer = await db.createCourse(teacher.id, { title: 'Newer', created_at: '2025-06-01' });
            await db.createCourse(otherTeacher.id, { title: 'Not mine' });
            const student = await db.createUser('Student');
            await db.enroll(student.id, older.id);

            const res = await request(app).get('/api/teacher/courses').set(authHeader(teacher));

            expect(res.status).toBe(200);
            expect(res.body.courses.map((c) => [c.id, Number(c.students_enrolled)])).toEqual([
                [newer.id, 0],
                [older.id, 1],
            ]);
            expect(res.body.courses[0]._links.map((l) => l.rel)).toEqual(
                expect.arrayContaining(['self', 'update', 'delete', 'create-assignment'])
            );
        });

        it('is closed to students', async () => {
            const student = await db.createUser('Student');
            const res = await request(app).get('/api/teacher/courses').set(authHeader(student));
            expect(res.status).toBe(403);
            expect(res.body.message).toBe('Access denied. Required role(s): teacher');
        });
    });

    describe('GET /api/teacher/courses/:id', () => {
        it('returns a course the teacher owns', async () => {
            const course = await db.createCourse(teacher.id, { title: 'Mine' });
            const res = await request(app).get(`/api/teacher/courses/${course.id}`).set(authHeader(teacher));
            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({ id: course.id, title: 'Mine' });
        });

        it('returns 404 for another teacher course', async () => {
            const course = await db.createCourse(otherTeacher.id);
            const res = await request(app).get(`/api/teacher/courses/${course.id}`).set(authHeader(teacher));
            expect(res.status).toBe(404);
        });
    });

    describe('POST /api/teacher/courses', () => {
        it('creates a course owned by the caller', async () => {
            const res = await request(app)
                .post('/api/teacher/courses')
                .set(authHeader(teacher))
                .send({ title: 'Physics', description: 'Mechanics', weeks: 10 });

            expect(res.status).toBe(201);
            expect(res.body).toMatchObject({ title: 'Physics', teacher_id: teacher.id, weeks: 10 });
        });

        it('requires a title and description', async () => {
            const res = await request(app)
                .post('/api/teacher/courses')
                .set(authHeader(teacher))
                .send({ title: 'Physics' });
            expect(res.status).toBe(400);
        });
    });

    describe('PUT /api/teacher/courses/:id', () => {
        it('updates the course and bumps updated_at', async () => {
            const course = await db.createCourse(teacher.id);
            const res = await request(app)
                .put(`/api/teacher/courses/${course.id}`)
                .set(authHeader(teacher))
                .send({ title: 'Renamed', description: 'New', weeks: 3 });

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({ title: 'Renamed', description: 'New', weeks: 3 });
            expect(new Date(res.body.updated_at) >= new Date(course.updated_at)).toBe(true);
        });

        it('refuses to update another teacher course', async () => {
            const course = await db.createCourse(otherTeacher.id, { title: 'Theirs' });
            const res = await request(app)
                .put(`/api/teacher/courses/${course.id}`)
                .set(authHeader(teacher))
                .send({ title: 'Mine now', description: 'x' });

            expect(res.status).toBe(404);
            const { rows } = await pool.query('SELECT title FROM courses WHERE id = $1', [course.id]);
            expect(rows[0].title).toBe('Theirs');
        });
    });

    describe('DELETE /api/teacher/courses/:id', () => {
        it('deletes the course and cascades to its assignments', async () => {
            const course = await db.createCourse(teacher.id);
            await db.createAssignment(course.id);

            const res = await request(app).delete(`/api/teacher/courses/${course.id}`).set(authHeader(teacher));

            expect(res.status).toBe(204);
            const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM assignments');
            expect(rows[0].n).toBe(0);
        });

        it('refuses to delete another teacher course', async () => {
            const course = await db.createCourse(otherTeacher.id);
            const res = await request(app).delete(`/api/teacher/courses/${course.id}`).set(authHeader(teacher));
            expect(res.status).toBe(404);
        });
    });
});
