const request = require('supertest');
const { app, pool } = require('../src/index');
const { createFixtures, authHeader } = require('./helpers/fixtures');

const db = createFixtures(pool);

describe('request validation', () => {
    let teacher;
    let student;
    let course;

    beforeEach(async () => {
        await db.resetDatabase();
        teacher = await db.createUser('Teacher');
        student = await db.createUser('Student');
        course = await db.createCourse(teacher.id);
        await db.enroll(student.id, course.id);
    });

    afterAll(() => pool.end());

    it.each([
        ['/api/teacher/courses/abc', 'id must be a positive integer'],
        ['/api/teacher/courses/0', 'id must be a positive integer'],
        ['/api/teacher/courses/99999999999', 'id must be a positive integer'],
        ['/api/teacher/assignments/1.5', 'id must be a positive integer'],
        ['/api/teacher/courses/x/assignments', 'courseId must be a positive integer'],
    ])('rejects the id in %s before it reaches Postgres', async (path, message) => {
        const res = await request(app).get(path).set(authHeader(teacher));
        expect(res.status).toBe(400);
        expect(res.body).toEqual({ error: 'Bad Request', message });
    });

    it('validates the admin drill-down ids', async () => {
        const admin = await db.createUser('Admin');
        const res = await request(app).get('/admin/students/me/courses').set(authHeader(admin));
        expect(res.status).toBe(400);
    });

    describe('course bodies', () => {
        const post = (body) => request(app).post('/api/teacher/courses').set(authHeader(teacher)).send(body);

        it('rejects a title longer than the column allows', async () => {
            const res = await post({ title: 'x'.repeat(256), description: 'd' });
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('title must be at most 255 characters');
        });

        it('rejects a blank title after trimming', async () => {
            const res = await post({ title: '   ', description: 'd' });
            expect(res.body.message).toBe('title is required');
        });

        it.each([0, 105, 2.5, 'many'])('rejects weeks = %p', async (weeks) => {
            const res = await post({ title: 't', description: 'd', weeks });
            expect(res.status).toBe(400);
        });

        it('accepts weeks sent as a form string and trims the title', async () => {
            const res = await post({ title: '  Statistics ', description: 'd', weeks: '12' });
            expect(res.status).toBe(201);
            expect(res.body).toMatchObject({ title: 'Statistics', weeks: 12 });
        });

        it('stores an empty weeks field as null', async () => {
            const res = await post({ title: 't', description: 'd', weeks: '' });
            expect(res.status).toBe(201);
            expect(res.body.weeks).toBeNull();
        });
    });

    describe('assignment bodies', () => {
        it('rejects a due date that is not a date', async () => {
            const res = await request(app)
                .post(`/api/teacher/courses/${course.id}/assignments`)
                .set(authHeader(teacher))
                .send({ title: 't', description: 'd', due_date: 'next tuesday' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('due_date must be a valid date');
        });
    });

    describe('student bodies', () => {
        it('rejects a non-numeric courseId on enroll', async () => {
            const res = await request(app).post('/api/student/enroll').set(authHeader(student)).send({ courseId: 'x' });
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('courseId must be a positive integer');
        });

        it('rejects a submission that is not text', async () => {
            const assignment = await db.createAssignment(course.id);
            const res = await request(app)
                .post('/api/student/submit-assignment')
                .set(authHeader(student))
                .send({ assignmentId: assignment.id, submission: { html: '<b>hi</b>' } });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('submission must be text');
        });
    });

    describe('grading bodies', () => {
        let assignment;
        let submission;

        beforeEach(async () => {
            assignment = await db.createAssignment(course.id);
            submission = await db.createSubmission(assignment.id, student.id);
        });

        it('rejects a grade that is not a number', async () => {
            const res = await request(app)
                .put(`/api/teacher/submissions/${submission.id}`)
                .set(authHeader(teacher))
                .send({ grade: 'A+' });
            expect(res.status).toBe(400);
        });

        it('rejects an out-of-range grade in a bulk request with 400 and changes nothing', async () => {
            const res = await request(app)
                .post(`/api/teacher/assignments/${assignment.id}/submissions/bulk-grade`)
                .set(authHeader(teacher))
                .send({ submissions: [{ submissionId: submission.id, grade: 140 }] });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Grade must be between 0 and 100');
            const { rows } = await pool.query('SELECT grade FROM submissions WHERE id = $1', [submission.id]);
            expect(rows[0].grade).toBeNull();
        });

        it('rejects a bulk request without a submissions array', async () => {
            const res = await request(app)
                .post(`/api/teacher/assignments/${assignment.id}/submissions/bulk-grade`)
                .set(authHeader(teacher))
                .send({});
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Submissions array is required and cannot be empty');
        });
    });
});
