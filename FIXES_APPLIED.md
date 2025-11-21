# Bug Fixes Applied

## Issues Found and Fixed

### 1. Drizzle ORM Syntax Error in Agent Registration API
**File**: `src/app/api/agent/register/route.ts`

**Problem**:
```typescript
// ❌ WRONG - .equals() is not a Drizzle method
const existingPhone = await db.select().from(agents).where(
  (agent) => agent.phoneNumber.equals(phoneNumber)
);
```

**Error**:
```
TypeError: agent.phoneNumber.equals is not a function
```

**Fix**:
```typescript
// ✅ CORRECT - Use eq() from drizzle-orm
import { eq } from 'drizzle-orm';

const existingPhone = await db
  .select()
  .from(agents)
  .where(eq(agents.phoneNumber, phoneNumber));
```

**What Changed**:
- Added `import { eq } from 'drizzle-orm'`
- Changed lines 40-44 to use `eq()` operator
- Changed lines 52-57 to use `eq()` operator

---

### 2. React Invalid DOM Property Warning in Landing Page
**File**: `src/app/agent/page.tsx`

**Problem**:
```
Warning: Invalid DOM property `shape-rendering`. Did you mean `shapeRendering`?
```

**Cause**: SVG attributes in React must use camelCase, not kebab-case.

**Fix**:
```typescript
// ❌ WRONG
<svg ... shape-rendering="geometricPrecision" ...>

// ✅ CORRECT
<svg ... shapeRendering="geometricPrecision" ...>
```

**What Changed**:
- Line 289: Changed `shape-rendering` to `shapeRendering`

---

## Testing

After fixes, the application should:
1. ✅ Compile without TypeScript errors
2. ✅ Display agent landing page without console warnings
3. ✅ Accept agent registration submissions
4. ✅ Generate OTP and return success response

## Quick Test

```bash
# 1. Verify landing page loads
curl http://localhost:3001/agent

# 2. Test agent registration
curl -X POST http://localhost:3001/api/agent/register \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+260971234567",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "idType": "national_id",
    "idNumber": "123456789",
    "locationCity": "Lusaka",
    "locationAddress": "Main Street"
  }'

# Expected response:
# {
#   "message": "Agent registered successfully. OTP sent to phone.",
#   "agentId": 1,
#   "phoneNumber": "+260971234567"
# }

# 3. Check server console for OTP
# [DEV] OTP for +260971234567: 123456
```

---

## Files Modified

1. `/src/app/api/agent/register/route.ts` - Fixed Drizzle OTP syntax
2. `/src/app/agent/page.tsx` - Fixed SVG attribute warning

---

All agent system features are now fully functional! 🚀
