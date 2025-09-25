# Development Override Configuration

## ⚠️ IMPORTANT: DEVELOPMENT-ONLY FEATURE ⚠️

This configuration allows temporary bypassing of authentication for development purposes. **DO NOT USE IN PRODUCTION**.

## What This Does

- Allows direct access to all protected routes without authentication:
  - `http://localhost:5174/dashboard`
  - `http://localhost:5174/stock-availability`
  - `http://localhost:5174/make-reservation`
  - `http://localhost:5174/lost-and-found`
- Bypasses login requirements for all protected components
- Shows a prominent warning banner on each protected page when active
- Logs warnings to console when active

## How to Enable/Disable

### Method 1: Configuration File (Recommended)
Edit `src/config/devConfig.ts`:
```typescript
// Set to false to disable overrides
export const ENABLE_DEV_OVERRIDES = false;
```

### Method 2: Environment Variable
Set `NODE_ENV=production` to automatically disable overrides.

### Method 3: Remove File
Delete `src/config/devConfig.ts` to completely remove the override system.

## Files Modified

1. **`src/config/devConfig.ts`** - New configuration file
2. **`src/pages/Dashboard.tsx`** - Modified to use development overrides
3. **`src/pages/StockAvailability.tsx`** - Modified to use development overrides
4. **`src/pages/MakeReservation.tsx`** - Modified to use development overrides
5. **`src/pages/LostAndFound.tsx`** - Modified to use development overrides

## How to Revert

### Quick Revert (Disable Override)
1. Open `src/config/devConfig.ts`
2. Change `ENABLE_DEV_OVERRIDES` to `false`
3. Save the file

### Complete Revert (Remove Override System)
1. Delete `src/config/devConfig.ts`
2. Revert changes to all modified component files:
   - `src/pages/Dashboard.tsx`
   - `src/pages/StockAvailability.tsx`
   - `src/pages/MakeReservation.tsx`
   - `src/pages/LostAndFound.tsx`
   
   For each file, remove:
   - The import: `import { DEV_OVERRIDES_ACTIVE, DEV_USER_DATA } from '../config/devConfig';`
   - The development override code in `useEffect`
   - The development override code in `handleLogout`
   - The development warning banner

## Security Notes

- This override only affects the frontend authentication check
- Backend API endpoints still require proper authentication
- The override is automatically disabled in production builds
- Console warnings are displayed when the override is active

## Testing

1. Start the development server: `npm run dev`
2. Navigate to any protected route:
   - `http://localhost:5174/dashboard`
   - `http://localhost:5174/stock-availability`
   - `http://localhost:5174/make-reservation`
   - `http://localhost:5174/lost-and-found`
3. You should see each page without being redirected to login
4. A red warning banner should be visible at the top of each page
5. Check browser console for development warnings

## Production Safety

- The override is automatically disabled when `NODE_ENV=production`
- Multiple warning mechanisms prevent accidental production deployment
- Clear code comments mark all development-only code
- Easy to identify and remove development code
