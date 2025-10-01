# Environment Variables Setup

## Overview
This project uses environment variables to manage sensitive configuration data like API keys, secrets, and database credentials.

## Files

### `.env` (Git Ignored)
Contains **actual** sensitive values. This file is ignored by Git and should **never** be committed.

### `.env.example` (Git Tracked)
Template file with placeholder values. This file is committed to Git and serves as a reference for other developers.

## Setup Instructions

### For New Developers

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your actual values in `.env`:
   - Get `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from [Google Cloud Console](https://console.cloud.google.com/)
   - Generate `NEXTAUTH_SECRET` using:
     ```bash
     openssl rand -base64 32
     ```
   - Update other values as needed

### For Existing Setup

If you already have a `.env` file with actual credentials, it will be used automatically by docker-compose.

## Important Notes

⚠️ **Never commit `.env` to Git!**
- The `.env` file is already in `.gitignore`
- Always use `.env.example` for reference

✅ **Always update `.env.example`**
- When adding new environment variables, update `.env.example` with placeholder values
- This helps other developers know what variables are required

## Docker Compose Integration

Docker Compose automatically reads variables from `.env` file in the project root. Variables are referenced using `${VARIABLE_NAME}` syntax in `docker-compose.yml`.

Example:
```yaml
environment:
  GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
  GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
```

## Verification

To verify environment variables are loaded correctly:
```bash
docker-compose config | grep GOOGLE_CLIENT_ID
```

This should show the actual value from your `.env` file (not the placeholder from `.env.example`).
