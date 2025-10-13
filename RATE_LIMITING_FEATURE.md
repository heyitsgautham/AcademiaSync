# API Key Rate Limiting Feature

## Overview
Added rate limiting security feature to the Admin Analytics API key authentication modal to prevent brute-force attacks.

## Implementation Details

### Key Features
1. **Maximum Attempts**: 5 failed attempts allowed
2. **Lockout Duration**: 30 seconds after reaching max attempts
3. **Persistent State**: Uses sessionStorage to maintain state across page refreshes
4. **Auto Reset**: Counter resets to 0 after successful authentication or lockout expires

### How It Works

#### 1. Failed Attempt Tracking
- Each failed API key validation increments the counter
- Counter is stored in `sessionStorage` as `api_key_failed_attempts`
- User sees remaining attempts: "Invalid API key. X attempt(s) remaining."

#### 2. Lockout Mechanism
- After 5 failed attempts, user is locked out for 30 seconds
- Lockout end time stored in `sessionStorage` as `api_key_lockout_end`
- Input field is disabled during lockout
- Submit button is disabled during lockout

#### 3. Countdown Timer
- Real-time countdown display showing remaining seconds
- Visual alert with orange/warning styling
- Timer icon indicator for better UX

#### 4. State Persistence
- Lockout persists across page refreshes/reloads
- On component mount, checks for existing lockout
- If lockout expired, automatically clears state

#### 5. Reset Conditions
- **Success**: Counter resets to 0 on successful API key validation
- **Timeout**: Counter resets to 0 after 30-second lockout expires
- **Manual Clear**: User can clear browser sessionStorage

### SessionStorage Keys
```typescript
api_key_failed_attempts    // Number of failed attempts
api_key_lockout_end        // Timestamp (ms) when lockout ends
analytics_api_key_valid    // Existing: API key validation status
analytics_api_key_timestamp // Existing: Validation timestamp
```

### UI Components

#### Error Messages
1. **Failed Attempt**: "Invalid API key. X attempt(s) remaining."
2. **Lockout Active**: "Too many failed attempts. Locked out for 30 seconds."
3. **Lockout Warning**: "Too many failed attempts. Please wait Xs."

#### Visual Indicators
- **Failed Attempts Counter**: Shows `X/5` when attempts > 0
- **Lockout Alert**: Orange warning box with Timer icon
- **Real-time Countdown**: Updates every second during lockout
- **Disabled Input**: Visual indication during lockout

### Code Constants
```typescript
const MAX_ATTEMPTS = 5          // Maximum allowed failed attempts
const LOCKOUT_DURATION = 30     // Lockout duration in seconds
```

### Security Benefits
1. **Prevents Brute Force**: Limits rapid-fire API key guessing
2. **Rate Limiting**: 30-second cooldown between lockouts
3. **User Feedback**: Clear messaging about security restrictions
4. **Persistent Protection**: Works across page reloads

### User Experience
- Clean, informative error messages
- Visual countdown for transparency
- Automatic unlock after timeout
- No permanent account lockout (session-based only)

## Testing the Feature

### Test Scenario 1: Failed Attempts
1. Open Admin Analytics page
2. Enter wrong API key 5 times
3. Verify lockout activates
4. Observe 30-second countdown
5. Verify auto-unlock after timeout

### Test Scenario 2: Persistence
1. Trigger lockout (5 failed attempts)
2. Refresh the page
3. Verify lockout persists
4. Wait for countdown to complete
5. Verify state clears

### Test Scenario 3: Success Reset
1. Enter wrong API key 3 times
2. Enter correct API key
3. Verify counter resets to 0
4. Verify no lockout triggered

## Files Modified
- `/frontend/components/api-key-modal.tsx` - Added rate limiting logic

## Dependencies Used
- `useState` - For component state management
- `useEffect` - For timer and persistence logic
- `sessionStorage` - For persistent state across reloads
- `lucide-react/Timer` - Timer icon for lockout alert
