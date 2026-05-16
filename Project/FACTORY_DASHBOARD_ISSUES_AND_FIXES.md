# Factory Dashboard Issues and Fixes

## Issues Identified

### 1. Database Schema Issues
- **Problem**: The `approval_status` enum doesn't include 'collected' as a valid value
- **Error**: "Data truncated for column 'approval_status' at row 1"
- **Cause**: Migration didn't properly update the enum values

### 2. Missing Columns
- **Problem**: `collected_at` column may not exist
- **Error**: "Unknown column 'collected_at' in 'order clause'"
- **Cause**: Incomplete migration

### 3. Model Function Issues
- **Problem**: `scrapCollection` function tries to insert factory columns that may not exist
- **Cause**: Migration dependency not handled gracefully

## Fixes Applied

### 1. Updated Migration Script (`run-migration.js`)
```bash
cd Project/Backend
node run-migration.js
```
This script:
- Checks current table structure
- Adds missing columns safely
- Updates enum to include all values: 'pending', 'approved', 'rejected', 'collected'
- Handles errors gracefully

### 2. Created Enum Fix Script (`fix-enum.js`)
```bash
cd Project/Backend
node fix-enum.js
```
This script specifically:
- Fixes the enum to include 'collected'
- Adds `collected_at` column if missing
- Tests the fix

### 3. Updated Backend Code

#### Factory Controller (`factory.controller.js`)
- Added error handling for missing `collected_at` column
- Graceful fallback to `dateNtime` for ordering

#### Scrap Collection Model (`scrapCollecction.model.js`)
- Added try-catch for `scrapCollection` function
- Handles missing factory columns gracefully
- Added error handling in `markAsCollected` function

### 4. Frontend Code Cleanup

#### Factory Dashboard (`factoryDashboard.tsx`)
- Removed unused style definitions
- Updated interface to use 'collected' instead of 'approved'/'rejected'
- Updated UI text and icons

#### Factory Review (`factoryReview.tsx`)
- Replaced approve/reject with single "Mark as Collected" action
- Updated modal and button styling
- Simplified workflow

#### Factory Approved → Collected (`factoryApproved.tsx`)
- Renamed to show collected items
- Updated API endpoint calls
- Changed styling and text

### 5. Removed Unused Files
- Deleted `factoryRejected.tsx`
- Removed references from `App.tsx`

## Testing Scripts Created

### 1. Comprehensive API Test (`test-factory-api.js`)
```bash
cd Project/Backend
node test-factory-api.js
```
Tests:
- Table structure
- Column existence
- Query functionality
- Dashboard stats
- markAsCollected function
- Factory user existence

### 2. Quick Enum Fix (`fix-enum.js`)
```bash
cd Project/Backend
node fix-enum.js
```
Specifically fixes the enum issue.

## Step-by-Step Fix Process

### Step 1: Fix Database Schema
```bash
cd Project/Backend
node fix-enum.js
```

### Step 2: Test the Fix
```bash
node test-factory-api.js
```

### Step 3: Start Backend Server
```bash
npm start
```

### Step 4: Test Frontend
- Open factory dashboard
- Try marking a collection as collected
- Check collected items page

## Expected Behavior After Fixes

### Factory Dashboard
- Shows "Pending Collection" and "Collected" stats
- Single action button: "Mark Collections"
- One secondary action: "Collected Items"

### Factory Review Page
- Lists pending collections
- Single blue button: "📦 Mark as Collected"
- Modal with optional notes field

### Collected Items Page
- Shows collections marked as collected
- Blue status badge: "📦 Collected"

## API Endpoints

### Working Endpoints
- `GET /api/factory/dashboard/stats` - Dashboard statistics
- `GET /api/factory/pending` - Pending collections
- `GET /api/factory/collected` - Collected collections
- `POST /api/factory/collection/:id/collect` - Mark as collected

### Database Schema After Fix
```sql
ALTER TABLE scrapCollection 
MODIFY COLUMN approval_status ENUM('pending', 'approved', 'rejected', 'collected') DEFAULT 'pending';

ALTER TABLE scrapCollection 
ADD COLUMN collected_at TIMESTAMP NULL DEFAULT NULL;
```

## Troubleshooting

### If enum error persists:
```sql
-- Check current enum
SHOW COLUMNS FROM scrapCollection WHERE Field = 'approval_status';

-- Fix manually
ALTER TABLE scrapCollection 
MODIFY COLUMN approval_status ENUM('pending', 'approved', 'rejected', 'collected') DEFAULT 'pending';
```

### If collected_at error persists:
```sql
-- Add column manually
ALTER TABLE scrapCollection 
ADD COLUMN collected_at TIMESTAMP NULL DEFAULT NULL;
```

### If factory user missing:
```sql
INSERT INTO users (name, email, mobile_No, address, role, password) 
VALUES ('Factory Manager', 'factory@scrapwale.com', '9876543210', 'Factory Address', 'factory', 'factory123');
```

## Files Modified

### Frontend
- `Project/Frontend/my-app/app/factoryDashboard.tsx`
- `Project/Frontend/my-app/app/factoryReview.tsx`
- `Project/Frontend/my-app/app/factoryApproved.tsx`
- `Project/Frontend/my-app/app/config/api.ts`
- `Project/Frontend/my-app/App.tsx`

### Backend
- `Project/Backend/controllers/factory.controller.js`
- `Project/Backend/models/scrapCollecction.model.js`
- `Project/Backend/routes/factory.route.js`
- `Project/Backend/utils/migration.js`

### New Files
- `Project/Backend/run-migration.js`
- `Project/Backend/fix-enum.js`
- `Project/Backend/test-factory-api.js`

## Summary

The factory dashboard has been completely refactored from an approve/reject system to a simple "mark as collected" system. All database schema issues have been addressed with robust error handling and migration scripts. The UI has been simplified and cleaned up to reflect the new workflow.