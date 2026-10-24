const request = require('supertest');
const { app, pool } = require('../src/index');
const { createFixtures, authHeader } = require('./helpers/fixtures');

const db = createFixtures(pool);

describe('GET /api/teacher/students-by-course', () => {
    let teacher;
    let algebra;
    let biology;

    beforeEach(async () => {
        await db.resetDatabase();
        teacher = await db.createUser('Teacher');
        const otherTeacher = await db.createUser('Teacher');
        algebra = await db.createCourse(teacher.id, { title: 'Algebra' });
        biology = await db.createCourse(teacher.id, { title: 'Biology' });
        const foreign = await db.createCourse(otherTeacher.id, { title: 'Foreign' });

        const ann = await db.createUser('Student', { first_name: 'Ann', last_name: 'Able' });
        const bob = await db.createUser('Student', { first_name: 'Bob', last_name: 'Baker' });
        await db.enroll(ann.id, algebra.id);
        await db.enroll(bob.id, algebra.id);
        await db.enroll(bob.id, biology.id);
        await db.enroll(ann.id, foreign.id);

        const quiz = await db.createAssignment(algebra.id);
        await db.createSubmission(quiz.id, ann.id, { grade: 90 });
        await db.createSubmission(quiz.id, bob.id, { grade: 70 });
    });

    afterAll(() => pool.end());

    it('groups the teacher students by course with average performance', async () => {
        const res = await request(app).get('/api/teacher/students-by-course').set(authHeader(teacher));

        expect(res.status).toBe(200);
        expect(res.body.pagination).toMatchObject({ totalItems: 2, currentPage: 1 });
        expect(res.body.data.map((c) => c.courseName)).toEqual(['Algebra', 'Biology']);
        expect(res.body.data[0]).toMatchObject({ studentCount: 2 });
        expect(res.body.data[0].students).toEqual([
            expect.objectContaining({ name: 'Ann Able', performance: '90' }),
            expect.objectContaining({ name: 'Bob Baker', performance: '70' }),
        ]);
        expect(res.body.data[1].students).toEqual([expect.objectContaining({ name: 'Bob Baker', performance: '0' })]);
    });

    it('filters to one course', async () => {
        const res = await request(app)
            .get(`/api/teacher/students-by-course?courseId=${biology.id}`)
            .set(authHeader(teacher));

        expect(res.status).toBe(200);
        expect(res.body.data.map((c) => c.courseId)).toEqual([String(biology.id)]);
        expect(res.body.pagination.totalItems).toBe(1);
    });

    it('sorts courses by name in descending order', async () => {
        const res = await request(app)
            .get('/api/teacher/students-by-course?sortBy=name&sortOrder=desc')
            .set(authHeader(teacher));

        expect(res.status).toBe(200);
        expect(res.body.data.map((c) => c.courseName)).toEqual(['Biology', 'Algebra']);
    });

    it('pages through courses', async () => {
        const res = await request(app).get('/api/teacher/students-by-course?limit=1&page=2').set(authHeader(teacher));

        expect(res.body.data.map((c) => c.courseName)).toEqual(['Biology']);
        expect(res.body.pagination).toMatchObject({ totalPages: 2, hasPrevPage: true, hasNextPage: false });
    });

    it('is closed to students', async () => {
        const student = await db.createUser('Student');
        const res = await request(app).get('/api/teacher/students-by-course').set(authHeader(student));
        expect(res.status).toBe(403);
    });
});
