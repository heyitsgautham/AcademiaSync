const request = require('supertest');
const bcrypt = require('bcryptjs');
const { app, pool } = require('../src/index');
const { createFixtures, authHeader } = require('./helpers/fixtures');

const db = createFixtures(pool);

describe('admin routes', () => {
    let admin;
    let teacher;
    let student;

    beforeEach(async () => {
        await db.resetDatabase();
        admin = await db.createUser('Admin', { first_name: 'Ada', last_name: 'Admin' });
        teacher = await db.createUser('Teacher', { first_name: 'Tom', last_name: 'Teacher', specialization: 'Physics' });
        student = await db.createUser('Student', { first_name: 'Sue', last_name: 'Student', age: 20 });
        const course = await db.createCourse(teacher.id, { title: 'Optics' });
        await db.enroll(student.id, course.id);
        const a1 = await db.createAssignment(course.id);
        const a2 = await db.createAssignment(course.id);
        await db.createSubmission(a1.id, student.id, { grade: 70 });
        await db.createSubmission(a2.id, student.id, { grade: 90 });
    });

    afterAll(() => pool.end());

    it('rejects a teacher', async () => {
        const res = await request(app).get('/admin/stats').set(authHeader(teacher));
        expect(res.status).toBe(403);
    });

    it('counts users, courses and the average grade', async () => {
        const res = await request(app).get('/admin/stats').set(authHeader(admin));

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ totalTeachers: 1, totalStudents: 1, totalCourses: 1, averageGrade: 80 });
    });

    describe('GET /admin/analytics', () => {
        it('requires the analytics API key', async () => {
            const res = await request(app).get('/admin/analytics').set(authHeader(admin));
            expect(res.status).toBe(401);
        });

        it('rejects a wrong API key', async () => {
            const res = await request(app).get('/admin/analytics?apiKey=nope').set(authHeader(admin));
            expect(res.status).toBe(403);
        });

        it('ranks students, teachers and courses by grade', async () => {
            const res = await request(app)
                .get('/admin/analytics?apiKey=test-analytics-key')
                .set(authHeader(admin));

            expect(res.status).toBe(200);
            expect(res.body.studentsPerTeacher).toEqual([{ teacherName: 'Tom Teacher', studentCount: 1 }]);
            expect(res.body.topStudents[0]).toMatchObject({ studentName: 'Sue Student', avgGrade: '80.00', submissionCount: 2 });
            expect(res.body.topTeachers[0]).toMatchObject({ teacherName: 'Tom Teacher', avgGrade: '80.00', studentCount: 1 });
            expect(res.body.topCourses).toEqual([
                { courseName: 'Optics', avgGrade: '80.00', enrolledCount: 1, submissionCount: 2 },
            ]);
        });
    });

    describe('teachers', () => {
        it('lists teachers with course and student counts', async () => {
            const res = await request(app).get('/admin/teachers').set(authHeader(admin));

            expect(res.status).toBe(200);
            expect(res.body.teachers).toEqual([
                expect.objectContaining({ id: teacher.id, specialization: 'Physics', courseCount: 1, studentCount: 1 }),
            ]);
        });

        it('creates a teacher with a hashed password', async () => {
            const res = await request(app).post('/admin/teachers').set(authHeader(admin)).send({
                firstName: 'Nia',
                lastName: 'New',
                email: 'nia@example.com',
                specialization: 'Biology',
                password: 'secret123',
            });

            expect(res.status).toBe(201);
            expect(res.body).toMatchObject({ email: 'nia@example.com', role: 'Teacher' });
            const { rows } = await pool.query('SELECT password_hash FROM users WHERE email = $1', ['nia@example.com']);
            expect(rows[0].password_hash).not.toBe('secret123');
            expect(await bcrypt.compare('secret123', rows[0].password_hash)).toBe(true);
        });

        it.each([
            [{ firstName: 'A', lastName: 'B', email: 'a@b.c', specialization: 'X' }, 'All fields are required'],
            [
                { firstName: 'A', lastName: 'B', email: 'a@b.c', specialization: 'X', password: '123' },
                'Password must be at least 6 characters',
            ],
        ])('rejects an invalid new teacher', async (body, error) => {
            const res = await request(app).post('/admin/teachers').set(authHeader(admin)).send(body);
            expect(res.status).toBe(400);
            expect(res.body.error).toBe(error);
        });

        it('refuses a duplicate email', async () => {
            const res = await request(app).post('/admin/teachers').set(authHeader(admin)).send({
                firstName: 'Dup',
                lastName: 'Licate',
                email: student.email,
                specialization: 'X',
                password: 'secret123',
            });
            expect(res.status).toBe(409);
        });

        it('updates a teacher', async () => {
            const res = await request(app)
                .put(`/admin/teachers/${teacher.id}`)
                .set(authHeader(admin))
                .send({ firstName: 'Thomas', lastName: 'Teacher', specialization: 'Optics' });

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({ firstName: 'Thomas', specialization: 'Optics' });
        });

        it('will not update or delete a student through the teacher routes', async () => {
            const put = await request(app)
                .put(`/admin/teachers/${student.id}`)
                .set(authHeader(admin))
                .send({ firstName: 'X', lastName: 'Y', specialization: 'Z' });
            expect(put.status).toBe(404);

            const del = await request(app).delete(`/admin/teachers/${student.id}`).set(authHeader(admin));
            expect(del.status).toBe(404);
        });

        it('deletes a teacher and their courses', async () => {
            const res = await request(app).delete(`/admin/teachers/${teacher.id}`).set(authHeader(admin));

            expect(res.status).toBe(200);
            const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM courses');
            expect(rows[0].n).toBe(0);
        });
    });

    it('lists students with enrollments and average score', async () => {
        const res = await request(app).get('/admin/students').set(authHeader(admin));

        expect(res.status).toBe(200);
        expect(res.body).toEqual([
            expect.objectContaining({ id: student.id, age: 20, enrolledCourses: 1, avgScore: '80.00' }),
        ]);
    });

    describe('POST /admin/promote-role', () => {
        it('promotes a student to teacher with a specialization', async () => {
            const res = await request(app)
                .post('/admin/promote-role')
                .set(authHeader(admin))
                .send({ userId: student.id, newRole: 'Teacher', specialization: 'Chemistry' });

            expect(res.status).toBe(200);
            expect(res.body.user).toMatchObject({ role: 'Teacher', specialization: 'Chemistry' });
        });

        it('promotes a user to admin', async () => {
            const res = await request(app)
                .post('/admin/promote-role')
                .set(authHeader(admin))
                .send({ userId: teacher.id, newRole: 'Admin' });

            expect(res.status).toBe(200);
            expect(res.body.user.role).toBe('Admin');
        });

        it.each([
            [{ newRole: 'Teacher' }, 400],
            [{ userId: 1, newRole: 'Student' }, 400],
            [{ userId: 1, newRole: 'Teacher' }, 400],
            [{ userId: 9999, newRole: 'Admin' }, 404],
        ])('rejects %j with %d', async (body, status) => {
            const res = await request(app).post('/admin/promote-role').set(authHeader(admin)).send(body);
            expect(res.status).toBe(status);
        });
    });

    describe('admin profile', () => {
        it('reads and updates the caller profile', async () => {
            const read = await request(app).get('/admin/profile').set(authHeader(admin));
            expect(read.body).toMatchObject({ id: admin.id, first_name: 'Ada' });

            const updated = await request(app)
                .put('/admin/profile')
                .set(authHeader(admin))
                .send({ first_name: 'Adele', last_name: 'Admin' });
            expect(updated.status).toBe(200);
            expect(updated.body.first_name).toBe('Adele');
        });

        it('requires a first name', async () => {
            const res = await request(app).put('/admin/profile').set(authHeader(admin)).send({ last_name: 'x' });
            expect(res.status).toBe(400);
        });
    });

    it('reports the role mix and the last week of enrollments', async () => {
        const res = await request(app).get('/admin/dashboard-analytics').set(authHeader(admin));

        expect(res.status).toBe(200);
        expect(res.body.userRoleDistribution).toEqual([
            { name: 'Student', value: 1 },
            { name: 'Teacher', value: 1 },
            { name: 'Admin', value: 1 },
        ]);
        expect(res.body.enrollmentTrend).toHaveLength(1);
        expect(res.body.enrollmentTrend[0].enrollments).toBe(1);
    });
});
