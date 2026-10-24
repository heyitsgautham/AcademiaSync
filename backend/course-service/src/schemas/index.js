const { z, typeError, toNumber, emptyToNull, positiveInt, requiredText, grade, optionalDate } = require('./common');

const courseBody = z.object({
    title: requiredText('title', 255),
    description: requiredText('description'),
    weeks: z.preprocess(
        (value) => toNumber(emptyToNull(value)),
        z
            .number({ error: 'weeks must be a number' })
            .int('weeks must be a whole number')
            .min(1, 'weeks must be between 1 and 104')
            .max(104, 'weeks must be between 1 and 104')
            .nullable()
            .optional()
    ),
});

const assignmentBody = z.object({
    title: requiredText('title', 255),
    description: requiredText('description'),
    due_date: optionalDate('due_date'),
});

const enrollBody = z.object({
    courseId: positiveInt('courseId'),
});

const submitAssignmentBody = z.object({
    assignmentId: positiveInt('assignmentId'),
    submission: requiredText('submission', 50000),
});

const gradeBody = z.object({
    grade,
    feedback: z.string({ error: 'feedback must be text' }).max(5000).nullable().optional(),
});

const bulkGradeBody = z.object({
    submissions: z
        .array(
            gradeBody.extend({ submissionId: positiveInt('submissionId') }),
            typeError(
                'Submissions array is required and cannot be empty',
                'Submissions array is required and cannot be empty'
            )
        )
        .min(1, 'Submissions array is required and cannot be empty')
        .max(500, 'At most 500 submissions can be graded at once'),
});

module.exports = { courseBody, assignmentBody, enrollBody, submitAssignmentBody, gradeBody, bulkGradeBody };
