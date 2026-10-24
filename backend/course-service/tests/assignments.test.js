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

    describe('assignment CRUD', () => {
        it('creates an assignment on an owned course', async () => {
            const res = await request(app)
                .post(`/api/teacher/courses/${course.id}/assignments`)
                .set(authHeader(teacher))
                .send({ title: 'Titration', description: 'Report the endpoint', due_date: '2030-05-01T10:00:00Z' });

            expect(res.status).toBe(201);
            expect(res.body).toMatchObject({ course_id: course.id, title: 'Titration' });
        });

        it('stores a missing due date as null', async () => {
            const res = await request(app)
                .post(`/api/teacher/courses/${course.id}/assignments`)
                .set(authHeader(teacher))
                .send({ title: 'Open', description: 'No deadline' });

            expect(res.status).toBe(201);
            expect(res.body.due_date).toBeNull();
        });

        it('refuses to add an assignment to another teacher course', async () => {
            const res = await request(app)
                .post(`/api/teacher/courses/${course.id}/assignments`)
                .set(authHeader(otherTeacher))
                .send({ title: 'Sneaky', description: 'x' });
            expect(res.status).toBe(404);
        });

        it('requires a title and description', async () => {
            const res = await request(app)
                .post(`/api/teacher/courses/${course.id}/assignments`)
                .set(authHeader(teacher))
                .send({ description: 'x' });
            expect(res.status).toBe(400);
        });

        it('lists a course assignments by due date with submission counts', async () => {
            const late = await db.createAssignment(course.id, { due_date: '2030-02-01' });
            const early = await db.createAssignment(course.id, { due_date: '2030-01-01' });
            const student = await db.createUser('Student');
            await db.createSubmission(late.id, student.id);

            const res = await request(app)
                .get(`/api/teacher/courses/${course.id}/assignments`)
                .set(authHeader(teacher));

            expect(res.status).toBe(200);
            expect(res.body.assignments.map((a) => [a.id, Number(a.submission_count)])).toEqual([
                [early.id, 0],
                [late.id, 1],
            ]);
        });

        it('reads, updates and deletes one assignment', async () => {
            const assignment = await db.createAssignment(course.id);
            const path = `/api/teacher/assignments/${assignment.id}`;

            const read = await request(app).get(path).set(authHeader(teacher));
            expect(read.status).toBe(200);
            expect(read.body.teacher_id).toBe(teacher.id);

            const updated = await request(app)
                .put(path)
                .set(authHeader(teacher))
                .send({ title: 'Edited', description: 'Edited too' });
            expect(updated.status).toBe(200);
            expect(updated.body).toMatchObject({ title: 'Edited', due_date: null });

            const removed = await request(app).delete(path).set(authHeader(teacher));
            expect(removed.status).toBe(204);
            expect((await request(app).get(path).set(authHeader(teacher))).status).toBe(404);
        });

        it('hides one teacher assignment from another', async () => {
            const assignment = await db.createAssignment(course.id);
            const path = `/api/teacher/assignments/${assignment.id}`;

            expect((await request(app).get(path).set(authHeader(otherTeacher))).status).toBe(404);
            expect(
                (await request(app).put(path).set(authHeader(otherTeacher)).send({ title: 'x', description: 'y' }))
                    .status
            ).toBe(404);
            expect((await request(app).delete(path).set(authHeader(otherTeacher))).status).toBe(404);
        });
    });

    describe('grading', () => {
        let assignment;
        let student;
        let submission;

        beforeEach(async () => {
            assignment = await db.createAssignment(course.id);
            student = await db.createUser('Student');
            await db.enroll(student.id, course.id);
            submission = await db.createSubmission(assignment.id, student.id);
        });

        it('grades one submission', async () => {
            const res = await request(app)
                .put(`/api/teacher/submissions/${submission.id}`)
                .set(authHeader(teacher))
                .send({ grade: 92.5, feedback: 'Great' });

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({ feedback: 'Great' });
            expect(Number(res.body.grade)).toBe(92.5);
        });

        it.each([-1, 101])('rejects a grade of %d', async (grade) => {
            const res = await request(app)
                .put(`/api/teacher/submissions/${submission.id}`)
                .set(authHeader(teacher))
                .send({ grade });
            expect(res.status).toBe(400);
        });

        it('refuses to grade a submission in another teacher course', async () => {
            const res = await request(app)
                .put(`/api/teacher/submissions/${submission.id}`)
                .set(authHeader(otherTeacher))
                .send({ grade: 10 });
            expect(res.status).toBe(404);
        });

        it('bulk grades submissions in one transaction', async () => {
            const second = await db.createUser('Student');
            const other = await db.createSubmission(assignment.id, second.id);

            const res = await request(app)
                .post(`/api/teacher/assignments/${assignment.id}/submissions/bulk-grade`)
                .set(authHeader(teacher))
                .send({
                    submissions: [
                        { submissionId: submission.id, grade: 70, feedback: 'ok' },
                        { submissionId: other.id, grade: 80, feedback: 'good' },
                    ],
                });

            expect(res.status).toBe(200);
            expect(res.body.count).toBe(2);
            const { rows } = await pool.query('SELECT id, grade::float FROM submissions ORDER BY id');
            expect(rows).toEqual([
                { id: submission.id, grade: 70 },
                { id: other.id, grade: 80 },
            ]);
        });

        it('requires a non-empty submissions array for bulk grading', async () => {
            const res = await request(app)
                .post(`/api/teacher/assignments/${assignment.id}/submissions/bulk-grade`)
                .set(authHeader(teacher))
                .send({ submissions: [] });
            expect(res.status).toBe(400);
        });
    });

    describe('teacher overviews', () => {
        it('reports per-assignment status counts and filters by status', async () => {
            const done = await db.createAssignment(course.id, { title: 'Done', due_date: '2020-01-01' });
            const open = await db.createAssignment(course.id, { title: 'Open', due_date: '2099-01-01' });
            const ann = await db.createUser('Student');
            const bob = await db.createUser('Student');
            await db.enroll(ann.id, course.id);
            await db.enroll(bob.id, course.id);
            await db.createSubmission(done.id, ann.id, { grade: 90 });
            await db.createSubmission(done.id, bob.id, { grade: 70 });
            await db.createSubmission(open.id, ann.id);

            const res = await request(app).get('/api/teacher/assignments-with-status').set(authHeader(teacher));

            expect(res.status).toBe(200);
            const byTitle = Object.fromEntries(res.body.map((a) => [a.title, a]));
            expect(byTitle.Done).toMatchObject({
                total_students: 2,
                total_submissions: 2,
                graded_submissions: 2,
                not_submitted: 0,
                average_grade: 80,
                late_submissions: 2,
                is_overdue: true,
                course_name: 'Chemistry',
            });
            expect(byTitle.Open).toMatchObject({
                total_submissions: 1,
                submitted_not_graded: 1,
                not_submitted: 1,
                average_grade: null,
                is_overdue: false,
            });

            const submitted = await request(app)
                .get('/api/teacher/assignments-with-status?status=submitted')
                .set(authHeader(teacher));
            expect(submitted.body.map((a) => a.title)).toEqual(['Open']);

            const late = await request(app)
                .get('/api/teacher/assignments-with-status?status=late')
                .set(authHeader(teacher));
            expect(late.body.map((a) => a.title)).toEqual(['Done']);
        });

        it('lists recent submissions newest first with a relative time', async () => {
            const assignment = await db.createAssignment(course.id, { title: 'Essay' });
            const ann = await db.createUser('Student', { first_name: 'Ann', last_name: 'Lee' });
            const bob = await db.createUser('Student', { first_name: 'Bob', last_name: 'Ray' });
            await db.createSubmission(assignment.id, ann.id, { submitted_at: new Date(Date.now() - 3 * 3600000) });
            await db.createSubmission(assignment.id, bob.id, {
                grade: 75,
                submitted_at: new Date(Date.now() - 2 * 86400000),
            });

            const res = await request(app).get('/api/teacher/recent-submissions?limit=5').set(authHeader(teacher));

            expect(res.status).toBe(200);
            expect(res.body.map((s) => [s.studentName, s.submittedAt, s.status])).toEqual([
                ['Ann Lee', '3 hours ago', 'pending'],
                ['Bob Ray', '2 days ago', 'completed'],
            ]);
            expect(res.body[0]).toMatchObject({ course: 'Chemistry', assignment: 'Essay' });
        });
    });

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
