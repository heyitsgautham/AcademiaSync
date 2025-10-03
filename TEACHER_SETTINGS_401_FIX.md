# Teacher Settings 401 Error - Root Cause & Fix

## Problem
```
GET http://localhost:3000/api/teacher/profile 401 (Unauthorized)
```

Even though the user was logged in and other API endpoints were working.

## Root Cause Analysis

### Request Flow
```
Frontend Component (teacher-settings-sections.tsx)
    ↓ fetch("/api/teacher/profile")
Next.js API Route (/api/teacher/profile/route.ts)
    ↓ Extracts session.backendAccessToken
    ↓ Sends: Authorization: Bearer <token>
User Service (/api/users/profile)
    ↓ authenticate() middleware
    ❌ ONLY checked req.cookies.accessToken
    ❌ IGNORED Authorization header
```

### The Issue

The **user-service authentication middleware** was only looking for tokens in cookies:

```javascript
// ❌ OLD CODE - Only cookies
const authenticate = (req, res, next) => {
    const token = req.cookies.accessToken;  // Only here!
    
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    // ...
}
```

But the **Next.js API route** was sending the token in the Authorization header:

```typescript
// Frontend API route sends token in header
const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
  headers: {
    Authorization: `Bearer ${session.backendAccessToken}`,  // ← Here!
  },
})
```

### Why Other Endpoints Worked

Course-service already had the correct implementation that checks both sources:

```javascript
// ✅ course-service/src/middleware/auth.js (WORKING)
let token = null;
if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
} else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.substring(7);
}
```

## The Fix

Updated `backend/user-service/src/middleware/auth.js` to match the pattern:

```javascript
// ✅ NEW CODE - Supports both cookies and Authorization header
const authenticate = (req, res, next) => {
    try {
        // Support both cookies and Authorization header
        let token = null;
        if (req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        } else if (req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.substring(7);
        }

        if (!token) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Access token not found'
            });
        }

        // Verify token
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: error.message
        });
    }
};
```

## Why This Architecture?

From the copilot instructions (Authentication & Authorization Architecture):

> - **httpOnly cookies** work only on the same port (5000 ↔ 5000) ✅
> - **Cross-port requests** (3000 → 5001) cannot use cookies ❌
> - **Solution**: Store backend JWT in NextAuth session, send in Authorization header ✅

### Port Mapping
- Frontend: `3000`
- User Service: `5000`
- Course Service: `5001`

### Token Delivery Methods

| Request Type | Token Method | Why |
|-------------|--------------|-----|
| `3000 → 3000` (Next.js API routes) | NextAuth session | Server-side session access |
| `3000 → 5000` (Frontend → User Service) | Authorization header | Cross-port, no cookies |
| `3000 → 5001` (Frontend → Course Service) | Authorization header | Cross-port, no cookies |
| `5000 ↔ 5000` (Direct to User Service) | Cookies | Same port, httpOnly works |

## Verification

### Before Fix
```bash
$ docker logs academiasync-user-service --tail 5
GET /api/users/profile 401 0.475 ms - 59  # ❌ Unauthorized
GET /api/users/profile 401 0.633 ms - 59  # ❌ Unauthorized
```

### After Fix
```bash
$ docker logs academiasync-user-service --tail 5
GET /api/users/profile 200 15.234 ms - 156  # ✅ Success
```

## Files Modified

1. **backend/user-service/src/middleware/auth.js**
   - Updated `authenticate()` to check both `req.cookies.accessToken` AND `req.headers.authorization`
   
2. **frontend/app/api/teacher/profile/route.ts**
   - Added `request: Request` parameter (Next.js App Router requirement)
   - Changed response field from `message` to `error` (consistency)

3. **backend/user-service/src/routes/users.js** (New file)
   - GET `/api/users/profile` - Fetch user profile
   - PUT `/api/users/profile` - Update user profile

4. **backend/user-service/src/index.js**
   - Registered new `/api/users` route

## Testing Checklist

- [x] User can access `/teacher/settings` without 401 error
- [x] Profile data loads from database
- [x] Form fields are pre-filled with user data
- [x] User can update profile information
- [x] Changes persist in database
- [x] Other endpoints still work (dashboard, courses, etc.)

## Key Takeaway

**Always check BOTH authentication methods in microservices:**
- Cookies for same-origin requests
- Authorization headers for cross-origin/cross-port requests

This pattern is documented in `.github/copilot-instructions.md` under "Authentication & Authorization Architecture".
