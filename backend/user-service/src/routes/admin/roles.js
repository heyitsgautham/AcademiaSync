/**
 * Moves a user to a new role, refusing changes that would leave the data inconsistent.
 * @param {Pool} pool - PostgreSQL connection pool
 * @param {object} change
 * @param {number} change.userId - User to change
 * @param {'Student'|'Teacher'|'Admin'} change.newRole - Role to give them
 * @param {string} [change.specialization] - Required when the new role is Teacher
 * @param {number} change.actorId - Admin making the change, who may not change their own role
 * @returns {Promise<{user: object}|{status: number, error: string}>}
 */
const changeUserRole = async (pool, { userId, newRole, specialization, actorId }) => {
    if (Number(userId) === Number(actorId)) {
        return { status: 400, error: 'You cannot change your own role' };
    }

    const existing = await pool.query('SELECT id, role FROM users WHERE id = $1', [userId]);
    if (existing.rows.length === 0) {
        return { status: 404, error: 'User not found' };
    }

    // A course must belong to a teacher, so a teacher who still owns courses keeps the role.
    if (existing.rows[0].role === 'Teacher' && newRole !== 'Teacher') {
        const owned = await pool.query('SELECT COUNT(*)::int AS count FROM courses WHERE teacher_id = $1', [userId]);
        if (owned.rows[0].count > 0) {
            return {
                status: 409,
                error: `This teacher still owns ${owned.rows[0].count} course(s). Delete or reassign them first.`,
            };
        }
    }

    const result =
        newRole === 'Teacher'
            ? await pool.query(
                  `UPDATE users
                   SET role = $1, specialization = $2, updated_at = CURRENT_TIMESTAMP
                   WHERE id = $3
                   RETURNING id, email, first_name as "firstName", last_name as "lastName", role, specialization`,
                  [newRole, specialization, userId]
              )
            : await pool.query(
                  `UPDATE users
                   SET role = $1, updated_at = CURRENT_TIMESTAMP
                   WHERE id = $2
                   RETURNING id, email, first_name as "firstName", last_name as "lastName", role`,
                  [newRole, userId]
              );

    return { user: result.rows[0] };
};

module.exports = { changeUserRole };
