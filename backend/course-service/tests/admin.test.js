const request = require('supertest');
const { app, pool } = require('../src/index');
const { createFixtures, authHeader } = require('./helpers/fixtures');

const db = createFixtures(pool);

describe('admin course routes', () => {
    let admin;
    let teacher;
    let student;
    let course;

    beforeEach(async () => {
        await db.resetDatabase();
        admin = await db.createUser('Admin');
        teacher = await db.createUser('Teacher', { first_name: 'Tia', last_name: 'Teach', specialization: 'Math' });
        student = await db.createUser('Student', { first_name: 'Stu', last_name: 'Dent' });
        course = await db.createCourse(teacher.id, { title: 'Calculus' });
        await db.enroll(student.id, course.id);
        const a1 = await db.createAssignment(course.id);
        await db.createAssignment(course.id);
        await db.createSubmission(a1.id, student.id, { grade: 84 });
    });

    afterAll(() => pool.end());

    it('rejects non-admins', async () => {
        const res = await request(app).get('/admin/courses').set(authHeader(teacher));
        expect(res.status).toBe(403);
    });

    it('lists every course with its teacher and enrollment count', async () => {
        const res = await request(app).get('/admin/courses').set(authHeader(admin));

        expect(res.status).toBe(200);
        expect(res.body).toEqual([
            expect.objectContaining({
                id: course.id,
                title: 'Calculus',
                teacherId: teacher.id,
                teacherName: 'Tia Teach',
                enrolledCount: 1,
            }),
        ]);
    });

    it('merges course and enrollment events into recent activity', async () => {
        const res = await request(app).get('/admin/recent-activity').set(authHeader(admin));

        expect(res.status).toBe(200);
        expect(res.body.map((a) => a.type).sort()).toEqual(['course_created', 'student_enrolled']);
        expect(res.body.find((a) => a.type === 'student_enrolled')).toMatchObject({
            actorName: 'Stu Dent',
            courseName: 'Calculus',
            studentId: student.id,
        });
    });

    it('shows a student courses with grade progress', async () => {
        const res = await request(app).get(`/admin/students/${student.id}/courses`).set(authHeader(admin));

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ studentId: student.id, firstName: 'Stu' });
        expect(res.body.courses).toEqual([
            expect.objectContaining({
                courseId: course.id,
                instructorName: 'Tia Teach',
                averageGrade: 84,
                totalSubmissions: 1,
                totalAssignments: 2,
            }),
        ]);
    });

    it('returns 404 when the id is not a student', async () => {
        const res = await request(app).get(`/admin/students/${teacher.id}/courses`).set(authHeader(admin));
        expect(res.status).toBe(404);
    });

    it('shows a teacher courses with class stats', async () => {
        const res = await request(app).get(`/admin/teachers/${teacher.id}/courses`).set(authHeader(admin));

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ teacherId: teacher.id, specialization: 'Math' });
        expect(res.body.courses).toEqual([
            expect.objectContaining({ courseId: course.id, studentCount: 1, averageGrade: 84, totalAssignments: 2 }),
        ]);
    });

    it('returns 404 when the id is not a teacher', async () => {
        const res = await request(app).get(`/admin/teachers/${student.id}/courses`).set(authHeader(admin));
        expect(res.status).toBe(404);
    });

    it('lists the grades of every student in a course', async () => {
        const res = await request(app).get(`/admin/courses/${course.id}/students/grades`).set(authHeader(admin));

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ courseId: course.id, teacherName: 'Tia Teach' });
        expect(res.body.students).toEqual([
            expect.objectContaining({ studentId: student.id, averageGrade: 84, totalSubmissions: 1, totalAssignments: 2 }),
        ]);
    });

    it('returns 404 for an unknown course', async () => {
        const res = await request(app).get('/admin/courses/9999/students/grades').set(authHeader(admin));
        expect(res.status).toBe(404);
    });
});
