# Teacher Settings - Data Pre-filling Flow

## 🔄 How Data is Pre-filled

### 1. Component Mounting
```tsx
const [profileData, setProfileData] = useState({
  first_name: "",      // ← Starts empty
  last_name: "",       // ← Starts empty
  age: "",             // ← Starts empty
  specialization: "", // ← Starts empty
})
```

### 2. Data Fetching (useQuery)
```tsx
const { data: profile, isLoading } = useQuery<TeacherProfile>({
  queryKey: ["teacher-profile"],
  queryFn: async () => {
    const res = await fetch("/api/teacher/profile")
    return res.json()
  },
})
```

**Backend returns:**
```json
{
  "id": 1,
  "email": "teacher@example.com",
  "first_name": "Sarah",
  "last_name": "Johnson",
  "age": 35,
  "specialization": "Computer Science",
  "role": "Teacher"
}
```

### 3. Automatic Form Population (useEffect)
```tsx
useEffect(() => {
  if (profile) {
    setProfileData({
      first_name: profile.first_name || "",      // ← "Sarah"
      last_name: profile.last_name || "",        // ← "Johnson"
      age: profile.age?.toString() || "",        // ← "35"
      specialization: profile.specialization || "", // ← "Computer Science"
    })
  }
}, [profile]) // ← Runs whenever profile changes
```

### 4. Form Rendering with Pre-filled Values
```tsx
<Input
  id="first_name"
  value={profileData.first_name}  // ← Shows "Sarah"
  onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
/>

<Input
  id="last_name"
  value={profileData.last_name}  // ← Shows "Johnson"
  onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
/>

<Input
  id="age"
  type="number"
  value={profileData.age}  // ← Shows "35"
  onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
/>

<Input
  id="specialization"
  value={profileData.specialization}  // ← Shows "Computer Science"
  onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
/>

<Input
  id="email"
  value={profile?.email || ""}  // ← Shows "teacher@example.com" (read-only)
  disabled
/>
```

## ✅ Loading States

### Phase 1: Loading
```tsx
if (isLoading) {
  return <Loader2 className="animate-spin" />  // ← Shows spinner
}
```

### Phase 2: No Data
```tsx
if (!profile) {
  return <p>Unable to load profile data</p>  // ← Safety check
}
```

### Phase 3: Data Loaded
```tsx
return (
  <Card>
    {/* All fields are now pre-filled with data */}
  </Card>
)
```

## 🔄 Update Flow

### User edits a field:
```
User types in input
    ↓
onChange event fires
    ↓
setProfileData updates state
    ↓
Input re-renders with new value
```

### User clicks "Save Changes":
```
1. Validation runs
2. useMutation sends PUT request
3. Backend updates database
4. Success toast appears
5. queryClient.invalidateQueries refetches data
6. useEffect re-populates form with fresh data
```

## 🎯 Key Features

✅ **Automatic Pre-filling**: Form populates immediately when data loads
✅ **Loading State**: Shows spinner while fetching data
✅ **Error Handling**: Shows message if data fails to load
✅ **Fallback Values**: Uses empty strings if fields are null/undefined
✅ **Type Safety**: Age is converted from number to string for input
✅ **Controlled Inputs**: All inputs are controlled components
✅ **Real-time Updates**: Changes reflect immediately in the UI
✅ **Data Persistence**: Values persist after successful save

## 🧪 Testing the Pre-fill

1. **Initial Load**:
   - Navigate to `/teacher/settings`
   - Should see spinner briefly
   - Form fields populate with database values

2. **Edit & Save**:
   - Change "First Name" from "Sarah" to "Sara"
   - Click "Save Changes"
   - Success toast appears
   - Form still shows "Sara" (updated value)

3. **Refresh Page**:
   - Reload the page
   - Form still shows "Sara" (persisted in database)

4. **Empty Fields**:
   - If age is null in database, field shows empty (not "null" or "undefined")
   - If specialization is null, field shows empty placeholder text

## 🔒 Read-only Email

The email field is special:
```tsx
<Input 
  value={profile?.email || ""} 
  disabled 
  className="bg-muted"
/>
```
- ✅ Always shows current email from profile (not from profileData state)
- ✅ Cannot be edited (disabled)
- ✅ Visual feedback (muted background)
- ✅ Helper text explains why ("linked to Google account")

## 📝 Data Flow Summary

```
Database (PostgreSQL)
    ↓
Backend API (/api/users/profile)
    ↓
Next.js API Route (/api/teacher/profile)
    ↓
React Query (useQuery)
    ↓
useEffect (watches profile)
    ↓
setProfileData (updates state)
    ↓
Input Components (render with values)
    ↓
User sees pre-filled form ✅
```

All fields are **automatically pre-filled** from the database when the component loads!
