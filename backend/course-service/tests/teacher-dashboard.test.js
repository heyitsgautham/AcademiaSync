const request = require('supertest');
const { app, pool } = require('../src/index');
const { createFixtures, authHeader } = require('./helpers/fixtures');

const db = createFixtures(pool);

describe('teacher stats and analytics', () => {
    let teacher;

    beforeEach(async () => {
        await db.resetDatabase();
        teacher = await db.createUser('Teacher');
        const otherTeacher = await db.createUser('Teacher');
        const math = await db.createCourse(teacher.id, { title: 'Math' });
        const art = await db.createCourse(teacher.id, { title: 'Art' });
        const foreign = await db.createCourse(otherTeacher.id, { title: 'Foreign' });

        const ann = await db.createUser('Student');
        const bob = await db.createUser('Student');
        await db.enroll(ann.id, math.id);
        await db.enroll(bob.id, math.id);
        await db.enroll(ann.id, art.id);
        await db.enroll(bob.id, foreign.id);

        const quiz = await db.createAssignment(math.id, { title: 'Quiz' });
        const sketch = await db.createAssignment(art.id, { title: 'Sketch' });
        const elsewhere = await db.createAssignment(foreign.id);
        await db.createSubmission(quiz.id, ann.id, { grade: 95 });
        await db.createSubmission(quiz.id, bob.id, { grade: 65 });
        await db.createSubmission(sketch.id, ann.id);
        await db.createSubmission(elsewhere.id, bob.id, { grade: 10 });
    });

    afterAll(() => pool.end());

    it('summarises the teacher courses only', async () => {
        const res = await request(app).get('/api/teacher/stats').set(authHeader(teacher));

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            totalCourses: 2,
            totalStudents: 2,
            averageGrade: 80,
            pendingAssignmentsToGrade: 1,
        });
    });

    it('counts students per course and graded versus pending submissions', async () => {
        const res = await request(app).get('/api/teacher/analytics').set(authHeader(teacher));

        expect(res.status).toBe(200);
        expect(res.body.studentsPerCourse).toEqual([
            { course: 'Math', students: 2 },
            { course: 'Art', students: 1 },
        ]);
        expect(res.body.assignmentStatus).toEqual([
            { name: 'Completed', value: 2 },
            { name: 'Pending', value: 1 },
        ]);
    });

    it('returns course performance, completion rates and the grade distribution', async () => {
        const res = await request(app).get('/api/teacher/analytics/detailed').set(authHeader(teacher));

        expect(res.status).toBe(200);
        expect(res.body.coursePerformance).toEqual([{ course: 'Math', performance: 80 }]);
        expect(res.body.completionRates).toEqual(
            expect.arrayContaining([
                { assignment: 'Quiz', rate: 100 },
                { assignment: 'Sketch', rate: 100 },
            ])
        );
        expect(res.body.gradeDistribution).toEqual([
            { name: 'A (90-100)', value: 1 },
            { name: 'D (60-69)', value: 1 },
        ]);
        expect(res.body.studentProgress).toHaveLength(1);
        expect(res.body.studentProgress[0].progress).toBe(80);
    });

    it('returns zeros for a teacher with no courses', async () => {
        const fresh = await db.createUser('Teacher');
        const res = await request(app).get('/api/teacher/stats').set(authHeader(fresh));

        expect(res.body).toEqual({
            totalCourses: 0,
            totalStudents: 0,
            averageGrade: 0,
            pendingAssignmentsToGrade: 0,
        });
    });
});
