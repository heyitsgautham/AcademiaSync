const request = require('supertest');
const { app, pool } = require('../src/index');
const { createFixtures, authHeader } = require('./helpers/fixtures');

const db = createFixtures(pool);

describe('student routes', () => {
    let teacher;
    let student;

    beforeEach(async () => {
        await db.resetDatabase();
        teacher = await db.createUser('Teacher', { first_name: 'Ada', last_name: 'Lovelace' });
        student = await db.createUser('Student', { first_name: 'Sam', last_name: 'Student' });
    });

    afterAll(() => pool.end());

    describe('access control', () => {
        it('rejects requests without a token', async () => {
            const res = await request(app).get('/api/student/courses');
            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Access token not found');
        });

        it('rejects a malformed token', async () => {
            const res = await request(app)
                .get('/api/student/courses')
                .set('Authorization', 'Bearer not-a-jwt');
            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Invalid access token');
        });

        it('rejects a teacher token', async () => {
            const res = await request(app).get('/api/student/courses').set(authHeader(teacher));
            expect(res.status).toBe(403);
        });

        it('accepts the token from the accessToken cookie', async () => {
            const { tokenFor } = require('./helpers/fixtures');
            const res = await request(app)
                .get('/api/student/courses')
                .set('Cookie', `accessToken=${tokenFor(student)}`);
            expect(res.status).toBe(200);
        });
    });

    describe('GET /api/student/available-courses', () => {
        it('lists only courses the student has not joined, with the instructor name', async () => {
            const joined = await db.createCourse(teacher.id, { title: 'Joined' });
            const open = await db.createCourse(teacher.id, { title: 'Open', weeks: 6 });
            await db.enroll(student.id, joined.id);

            const res = await request(app).get('/api/student/available-courses').set(authHeader(student));

            expect(res.status).toBe(200);
            expect(res.body.courses).toHaveLength(1);
            expect(res.body.courses[0]).toMatchObject({
                id: open.id,
                title: 'Open',
                instructor: 'Ada Lovelace',
                duration: '6 weeks',
            });
            expect(res.body.courses[0]._links.map((l) => l.rel)).toContain('enroll');
        });
    });

    describe('POST /api/student/enroll', () => {
        it('requires a courseId', async () => {
            const res = await request(app).post('/api/student/enroll').set(authHeader(student)).send({});
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('courseId is required');
        });

        it('rejects an unknown course', async () => {
            const res = await request(app)
                .post('/api/student/enroll')
                .set(authHeader(student))
                .send({ courseId: 999 });
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Course not found');
        });

        it('enrolls the student once and refuses a second enrollment', async () => {
            const course = await db.createCourse(teacher.id);

            const first = await request(app)
                .post('/api/student/enroll')
                .set(authHeader(student))
                .send({ courseId: course.id });
            expect(first.status).toBe(200);
            expect(first.body.success).toBe(true);

            const second = await request(app)
                .post('/api/student/enroll')
                .set(authHeader(student))
                .send({ courseId: course.id });
            expect(second.status).toBe(409);

            const { rows } = await pool.query('SELECT * FROM enrollments WHERE student_id = $1', [student.id]);
            expect(rows).toHaveLength(1);
        });
    });

    describe('GET /api/student/courses', () => {
        it('reports progress as the share of assignments the student submitted', async () => {
            const course = await db.createCourse(teacher.id, { title: 'Algorithms' });
            await db.enroll(student.id, course.id);
            const a1 = await db.createAssignment(course.id);
            await db.createAssignment(course.id);
            await db.createAssignment(course.id);
            await db.createAssignment(course.id);
            await db.createSubmission(a1.id, student.id);

            const res = await request(app).get('/api/student/courses').set(authHeader(student));

            expect(res.status).toBe(200);
            expect(res.body.student).toEqual({ name: 'Sam Student', email: student.email });
            expect(res.body.courses).toHaveLength(1);
            expect(res.body.courses[0]).toMatchObject({ title: 'Algorithms', instructor: 'Ada Lovelace' });
            expect(Number(res.body.courses[0].progress)).toBe(25);
        });

        it('reports zero progress for a course with no assignments', async () => {
            const course = await db.createCourse(teacher.id);
            await db.enroll(student.id, course.id);

            const res = await request(app).get('/api/student/courses').set(authHeader(student));

            expect(Number(res.body.courses[0].progress)).toBe(0);
        });
    });

    describe('GET /api/student/assignments', () => {
        let course;
        let pending;
        let submitted;
        let graded;

        beforeEach(async () => {
            course = await db.createCourse(teacher.id, { title: 'Databases' });
            await db.enroll(student.id, course.id);
            pending = await db.createAssignment(course.id, { title: 'Pending', due_date: '2030-01-03' });
            submitted = await db.createAssignment(course.id, { title: 'Submitted', due_date: '2030-01-01' });
            graded = await db.createAssignment(course.id, { title: 'Graded', due_date: '2030-01-02' });
            await db.createSubmission(submitted.id, student.id);
            await db.createSubmission(graded.id, student.id, { grade: 88, feedback: 'Good' });

            const other = await db.createCourse(teacher.id, { title: 'Not enrolled' });
            await db.createAssignment(other.id);
        });

        it('derives each status from the submission and hides other courses', async () => {
            const res = await request(app).get('/api/student/assignments').set(authHeader(student));

            expect(res.status).toBe(200);
            const byName = Object.fromEntries(res.body.assignments.map((a) => [a.name, a]));
            expect(Object.keys(byName).sort()).toEqual(['Graded', 'Pending', 'Submitted']);
            expect(byName.Pending.status).toBe('Pending');
            expect(byName.Submitted.status).toBe('Submitted');
            expect(byName.Graded).toMatchObject({ status: 'Graded', feedback: 'Good', course: 'Databases' });
            expect(Number(byName.Graded.grade)).toBe(88);
            expect(res.body.courses).toEqual([{ id: course.id, title: 'Databases' }]);
        });

        it('sorts by due date when asked', async () => {
            const res = await request(app)
                .get('/api/student/assignments?sortBy=due_date&sortOrder=desc')
                .set(authHeader(student));

            expect(res.body.assignments.map((a) => a.name)).toEqual(['Pending', 'Graded', 'Submitted']);
        });

        it('filters by status', async () => {
            const res = await request(app)
                .get('/api/student/assignments?status=graded')
                .set(authHeader(student));

            expect(res.body.assignments.map((a) => a.id)).toEqual([graded.id]);
        });

        it('returns one assignment by id', async () => {
            const res = await request(app)
                .get(`/api/student/assignments/${pending.id}`)
                .set(authHeader(student));

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({ id: pending.id, courseId: course.id, status: 'Pending' });
        });

        it('hides an assignment from a course the student is not in', async () => {
            const other = await db.createCourse(teacher.id);
            const hidden = await db.createAssignment(other.id);

            const res = await request(app)
                .get(`/api/student/assignments/${hidden.id}`)
                .set(authHeader(student));

            expect(res.status).toBe(404);
        });
    });

    describe('POST /api/student/submit-assignment', () => {
        it('requires an assignmentId and a submission', async () => {
            const res = await request(app)
                .post('/api/student/submit-assignment')
                .set(authHeader(student))
                .send({ assignmentId: 1 });
            expect(res.status).toBe(400);
        });

        it('refuses a submission for a course the student is not in', async () => {
            const course = await db.createCourse(teacher.id);
            const assignment = await db.createAssignment(course.id);

            const res = await request(app)
                .post('/api/student/submit-assignment')
                .set(authHeader(student))
                .send({ assignmentId: assignment.id, submission: 'answer' });

            expect(res.status).toBe(403);
        });

        it('stores a submission and overwrites it on resubmit', async () => {
            const course = await db.createCourse(teacher.id);
            await db.enroll(student.id, course.id);
            const assignment = await db.createAssignment(course.id);

            for (const text of ['first draft', 'final answer']) {
                const res = await request(app)
                    .post('/api/student/submit-assignment')
                    .set(authHeader(student))
                    .send({ assignmentId: assignment.id, submission: text });
                expect(res.status).toBe(200);
            }

            const { rows } = await pool.query('SELECT submission_text FROM submissions WHERE student_id = $1', [
                student.id,
            ]);
            expect(rows).toEqual([{ submission_text: 'final answer' }]);
        });
    });

    describe('GET /api/student/dashboard', () => {
        it('summarises courses, due work, grades and recent activity', async () => {
            const course = await db.createCourse(teacher.id, { title: 'Networks' });
            await db.enroll(student.id, course.id);
            const a1 = await db.createAssignment(course.id);
            const a2 = await db.createAssignment(course.id);
            await db.createAssignment(course.id);
            await db.createSubmission(a1.id, student.id, { grade: 80 });
            await db.createSubmission(a2.id, student.id, { grade: 90 });

            const res = await request(app).get('/api/student/dashboard').set(authHeader(student));

            expect(res.status).toBe(200);
            expect(res.body.stats).toEqual({
                totalCourses: 1,
                assignmentsDue: 1,
                averageGrade: 85,
                gradedAssignments: 2,
            });
            expect(res.body.recentActivity).toHaveLength(2);
            expect(res.body.analytics.courseProgress).toEqual([{ course: 'Networks', progress: 66.67 }]);
            expect(res.body.analytics.submissionStatus).toEqual([
                { name: 'Graded', value: 2 },
                { name: 'Submitted', value: 0 },
                { name: 'Pending', value: 1 },
            ]);
        });

        it('returns zeroed stats for a new student', async () => {
            const res = await request(app).get('/api/student/dashboard').set(authHeader(student));

            expect(res.body.stats).toEqual({
                totalCourses: 0,
                assignmentsDue: 0,
                averageGrade: 0,
                gradedAssignments: 0,
            });
        });
    });

    describe('GET /api/student/analytics', () => {
        it('buckets grades into letter ranges in order', async () => {
            const course = await db.createCourse(teacher.id);
            await db.enroll(student.id, course.id);
            for (const grade of [95, 91, 72, 40]) {
                const a = await db.createAssignment(course.id);
                await db.createSubmission(a.id, student.id, { grade });
            }

            const res = await request(app).get('/api/student/analytics').set(authHeader(student));

            expect(res.status).toBe(200);
            expect(res.body.gradeDistribution).toEqual([
                { name: 'A (90-100)', value: 2 },
                { name: 'C (70-79)', value: 1 },
                { name: 'F (0-59)', value: 1 },
            ]);
            expect(res.body.gradeTrends).toHaveLength(1);
            expect(res.body.gradeTrends[0].grade).toBe(74.5);
        });

        it.each(['weekly', 'biweekly', 'monthly', 'unknown'])('accepts the %s filter', async (filter) => {
            const res = await request(app)
                .get(`/api/student/analytics?filter=${filter}`)
                .set(authHeader(student));

            expect(res.status).toBe(200);
            expect(Object.keys(res.body).sort()).toEqual([
                'assignmentCompletion',
                'courseProgress',
                'gradeDistribution',
                'gradeTrends',
            ]);
        });
    });
});
