const jwt = require('jsonwebtoken');
const {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    getRefreshTokenExpiry,
} = require('../src/utils/jwt');

const user = { id: 7, email: 'u@example.com', role: 'Teacher', first_name: 'not in token' };

describe('jwt utils', () => {
    it('puts only id, email and role in the access token', () => {
        const decoded = verifyAccessToken(generateAccessToken(user));
        expect(decoded).toMatchObject({ id: 7, email: 'u@example.com', role: 'Teacher' });
        expect(decoded.first_name).toBeUndefined();
    });

    it('signs access and refresh tokens with different secrets', () => {
        expect(() => verifyRefreshToken(generateAccessToken(user))).toThrow('Invalid or expired refresh token');
        expect(() => verifyAccessToken(generateRefreshToken(user))).toThrow('Invalid or expired access token');
    });

    it('rejects an expired token', () => {
        const expired = jwt.sign({ id: 1 }, process.env.JWT_SECRET, { expiresIn: -1 });
        expect(() => verifyAccessToken(expired)).toThrow('Invalid or expired access token');
    });

    it('puts the refresh expiry seven days out by default', () => {
        const days = (getRefreshTokenExpiry() - Date.now()) / 86400000;
        expect(days).toBeGreaterThan(6.99);
        expect(days).toBeLessThanOrEqual(7);
    });
});
