const { pool } = require('../src/index');
const admin = require('../src/queries/admin');
const { createFixtures } = require('./helpers/fixtures');

const db = createFixtures(pool);

afterAll(() => pool.end());

describe('admin queries', () => {
    let teacher;
    let otherTeacher;
    let ana;
    let ben;
    let algebra;
    let biology;

    beforeEach(async () => {
        await db.resetDatabase();
        teacher = await db.createUser('Teacher', { first_name: 'Tia', last_name: 'Teach', specialization: 'Math' });
        otherTeacher = await db.createUser('Teacher', { first_name: 'Omar', last_name: 'Other' });
        ana = await db.createUser('Student', { first_name: 'Ana', last_name: 'A' });
        ben = await db.createUser('Student', { first_name: 'Ben', last_name: 'B' });

        algebra = await db.createCourse(teacher.id, { title: 'Algebra', created_at: '2026-01-01T10:00:00Z' });
        biology = await db.createCourse(otherTeacher.id, { title: 'Biology', created_at: '2026-02-01T10:00:00Z' });

        await db.enroll(ana.id, algebra.id);
        await db.enroll(ben.id, algebra.id);
        await db.enroll(ana.id, biology.id);

        const quiz = await db.createAssignment(algebra.id);
        const essay = await db.createAssignment(algebra.id);
        await db.createAssignment(algebra.id);
        await db.createSubmission(quiz.id, ana.id, { grade: 80 });
        await db.createSubmission(essay.id, ana.id, { grade: 90 });
        await db.createSubmission(quiz.id, ben.id, { grade: 70 });
        // Ungraded work counts as neither a graded submission nor a zero.
        await db.createSubmission(essay.id, ben.id);
    });

    describe('listCourses', () => {
        it('returns each course once, newest first, with its teacher and distinct enrollments', async () => {
            const courses = await admin.listCourses(pool);

            expect(courses.map((c) => c.title)).toEqual(['Biology', 'Algebra']);
            expect(courses[1]).toEqual(
                expect.objectContaining({
                    id: algebra.id,
                    teacherId: teacher.id,
                    teacherName: 'Tia Teach',
                    teacherEmail: teacher.email,
                    enrolledCount: 2,
                })
            );
            expect(courses[0].enrolledCount).toBe(1);
        });
    });

    describe('studentCourses', () => {
        it("averages only the student's graded submissions per course", async () => {
            const result = await admin.studentCourses(pool, ana.id);

            expect(result).toEqual(expect.objectContaining({ studentId: ana.id, firstName: 'Ana' }));
            const byTitle = Object.fromEntries(result.courses.map((c) => [c.courseTitle, c]));
            expect(byTitle.Algebra).toEqual(
                expect.objectContaining({
                    instructorName: 'Tia Teach',
                    averageGrade: 85,
                    totalSubmissions: 2,
                    totalAssignments: 3,
                })
            );
            expect(byTitle.Biology).toEqual(
                expect.objectContaining({ averageGrade: null, totalSubmissions: 0, totalAssignments: 0 })
            );
        });

        it('leaves out ungraded submissions', async () => {
            const result = await admin.studentCourses(pool, ben.id);
            expect(result.courses).toEqual([
                expect.objectContaining({ courseTitle: 'Algebra', averageGrade: 70, totalSubmissions: 1 }),
            ]);
        });

        it('returns null for an id that is not a student', async () => {
            expect(await admin.studentCourses(pool, teacher.id)).toBeNull();
            expect(await admin.studentCourses(pool, 999999)).toBeNull();
        });
    });

    describe('teacherCourses', () => {
        it('totals students, assignments and graded scores per course', async () => {
            const result = await admin.teacherCourses(pool, teacher.id);

            expect(result).toEqual(expect.objectContaining({ teacherId: teacher.id, specialization: 'Math' }));
            expect(result.courses).toEqual([
                expect.objectContaining({
                    courseTitle: 'Algebra',
                    studentCount: 2,
                    totalAssignments: 3,
                    averageGrade: 80,
                }),
            ]);
        });

        it('returns null for an id that is not a teacher', async () => {
            expect(await admin.teacherCourses(pool, ana.id)).toBeNull();
        });
    });

    describe('courseStudentGrades', () => {
        it('lists enrolled students alphabetically with their averages', async () => {
            const result = await admin.courseStudentGrades(pool, algebra.id);

            expect(result).toEqual(
                expect.objectContaining({ courseTitle: 'Algebra', teacherName: 'Tia Teach', teacherId: teacher.id })
            );
            expect(result.students).toEqual([
                expect.objectContaining({
                    firstName: 'Ana',
                    averageGrade: 85,
                    totalSubmissions: 2,
                    totalAssignments: 3,
                }),
                expect.objectContaining({
                    firstName: 'Ben',
                    averageGrade: 70,
                    totalSubmissions: 1,
                    totalAssignments: 3,
                }),
            ]);
        });

        it('returns null for a course that does not exist', async () => {
            expect(await admin.courseStudentGrades(pool, 999999)).toBeNull();
        });
    });

    describe('recentActivity', () => {
        it('mixes course changes and enrollments, newest first', async () => {
            await pool.query("UPDATE enrollments SET enrolled_at = '2026-03-01T09:00:00Z' WHERE student_id = $1", [
                ben.id,
            ]);
            await pool.query("UPDATE enrollments SET enrolled_at = '2025-12-01T09:00:00Z' WHERE student_id = $1", [
                ana.id,
            ]);
            await pool.query("UPDATE courses SET updated_at = '2026-02-15T09:00:00Z' WHERE id = $1", [algebra.id]);

            const feed = await admin.recentActivity(pool, 4);

            expect(feed.map((a) => [a.type, a.courseName])).toEqual([
                ['student_enrolled', 'Algebra'],
                ['course_updated', 'Algebra'],
                ['course_created', 'Biology'],
                ['course_created', 'Algebra'],
            ]);
            expect(feed.map((a) => a.id)).toEqual(['activity-0', 'activity-1', 'activity-2', 'activity-3']);
            expect(feed[0]).toEqual(expect.objectContaining({ studentId: ben.id, actorName: 'Ben B' }));
            expect(feed[1]).toEqual(expect.objectContaining({ actorId: teacher.id, studentId: null }));
        });
    });
});

describe('mergeActivity', () => {
    it('sorts by sort_date across sources, cuts to the limit and drops sort_date', () => {
        const feed = admin.mergeActivity(
            [
                [{ type: 'course_created', sort_date: '2026-01-01T00:00:00Z' }],
                [
                    { type: 'student_enrolled', sort_date: '2026-03-01T00:00:00Z' },
                    { type: 'student_enrolled', sort_date: '2025-01-01T00:00:00Z' },
                ],
            ],
            2
        );

        expect(feed).toHaveLength(2);
        expect(feed.map((a) => a.type)).toEqual(['student_enrolled', 'course_created']);
        expect(feed[0]).not.toHaveProperty('sort_date');
    });

    it('returns an empty feed when there is no activity', () => {
        expect(admin.mergeActivity([[], []], 10)).toEqual([]);
    });
});
