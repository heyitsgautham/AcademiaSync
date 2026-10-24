const request = require('supertest');
const { app, pool } = require('../src/index');
const { createFixtures, authHeader } = require('./helpers/fixtures');

const db = createFixtures(pool);

describe('teacher assignment routes', () => {
    let teacher;
    let otherTeacher;
    let course;

    beforeEach(async () => {
        await db.resetDatabase();
        teacher = await db.createUser('Teacher');
        otherTeacher = await db.createUser('Teacher');
        course = await db.createCourse(teacher.id, { title: 'Chemistry' });
    });

    afterAll(() => pool.end());

    describe('GET /api/teacher/assignments/:assignmentId/submissions', () => {
        let assignment;
        let ann;
        let bob;
        let cat;

        beforeEach(async () => {
            assignment = await db.createAssignment(course.id, { title: 'Lab report' });
            ann = await db.createUser('Student', { first_name: 'Ann', last_name: 'A' });
            bob = await db.createUser('Student', { first_name: 'Bob', last_name: 'B' });
            cat = await db.createUser('Student', { first_name: 'Cat', last_name: 'C' });
            for (const s of [ann, bob, cat]) await db.enroll(s.id, course.id);
            await db.createSubmission(assignment.id, ann.id, { grade: 95 });
            await db.createSubmission(assignment.id, bob.id, { grade: 60 });
        });

        it('lists every enrolled student with their submission', async () => {
            const res = await request(app)
                .get(`/api/teacher/assignments/${assignment.id}/submissions`)
                .set(authHeader(teacher));

            expect(res.status).toBe(200);
            expect(res.body.assignment).toMatchObject({ id: assignment.id, title: 'Lab report' });
            expect(res.body.submissions.map((s) => [s.student_name, s.status])).toEqual([
                ['Ann A', 'Submitted'],
                ['Bob B', 'Submitted'],
                ['Cat C', 'No submission'],
            ]);
            expect(res.body.pagination.totalItems).toBe(3);
        });

        it('filters by status', async () => {
            const res = await request(app)
                .get(`/api/teacher/assignments/${assignment.id}/submissions?status=not-submitted`)
                .set(authHeader(teacher));

            expect(res.status).toBe(200);
            expect(res.body.submissions.map((s) => s.student_id)).toEqual([cat.id]);
            expect(res.body.pagination.totalItems).toBe(1);
        });

        it('filters by a grade range', async () => {
            const res = await request(app)
                .get(`/api/teacher/assignments/${assignment.id}/submissions?minGrade=50&maxGrade=70`)
                .set(authHeader(teacher));

            expect(res.status).toBe(200);
            expect(res.body.submissions.map((s) => s.student_id)).toEqual([bob.id]);
        });

        it('sorts by grade and pages the result', async () => {
            const res = await request(app)
                .get(`/api/teacher/assignments/${assignment.id}/submissions?sortBy=grade&sortOrder=desc&limit=1`)
                .set(authHeader(teacher));

            expect(res.body.submissions.map((s) => s.student_id)).toEqual([ann.id]);
            expect(res.body.pagination).toMatchObject({ totalPages: 3, nextPage: 2 });
        });

        it('hides another teacher assignment', async () => {
            const res = await request(app)
                .get(`/api/teacher/assignments/${assignment.id}/submissions`)
                .set(authHeader(otherTeacher));

            expect(res.status).toBe(404);
        });
    });
});
