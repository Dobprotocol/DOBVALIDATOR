# Profile Image Implementation Guide

## Problem
The profile picture (pfp) is not getting saved in the profile creation flow because:
1. The database schema doesn't have a `profileImage` field
2. There's no backend endpoint for uploading profile images
3. The frontend is storing images as blob URLs in localStorage instead of uploading them

## Solution Implemented

### 1. Database Schema Update

**File**: `backend/prisma/schema.prisma`
- Added `profileImage String?` field to the Profile model

**Migration**: `backend/scripts/add-profile-image-migration.sql`
- SQL script to add the column to the database
- Run this in DBeaver to apply the migration

### 2. Backend Changes

**File**: `backend/src/index.ts`
- Updated `/api/profile` endpoint to handle `profileImage` field
- Added new `/api/profile/upload-image` endpoint for file uploads
- Added static file serving for uploaded images

**File**: `backend/src/lib/database.ts`
- Updated `profileService.create()` to accept `profileImage` parameter
- Updated `profileService.update()` to handle `profileImage` updates
- Added `profileService.updateByWallet()` method

### 3. Frontend Changes

**File**: `frontend/app/api/profile/upload-image/route.ts`
- New API route that proxies profile image uploads to the backend

**File**: `frontend/lib/api-service.ts`
- Updated `createProfile()` to accept `profileImage` parameter
- Added `uploadProfileImage()` method

**File**: `frontend/app/profile/page.tsx`
- Updated `handleImageChange()` to upload images to backend
- Added error handling and fallback for development mode

## Implementation Steps

### Step 1: Database Migration
1. Open DBeaver and connect to your production database
2. Run the SQL script: `backend/scripts/add-profile-image-migration.sql`
3. Verify the column was added successfully

### Step 2: Deploy Backend Changes
1. Commit and push the backend changes to your production branch
2. The CI/CD pipeline will automatically deploy the updated backend
3. Verify the new endpoints are working:
   - `POST /api/profile` (updated to handle profileImage)
   - `POST /api/profile/upload-image` (new endpoint)
   - `GET /uploads/*` (static file serving)

### Step 3: Deploy Frontend Changes
1. Commit and push the frontend changes to your production branch
2. The CI/CD pipeline will automatically deploy the updated frontend
3. Test the profile image upload functionality

## Testing the Implementation

### 1. Test Profile Image Upload
1. Navigate to the profile page
2. Click on the profile image area
3. Select an image file (JPG, PNG, etc.)
4. Verify the image uploads and displays correctly
5. Check that the image URL is saved in the database

### 2. Test Profile Creation/Update
1. Fill out the profile form with an image
2. Submit the form
3. Verify the profile is created/updated with the image URL
4. Refresh the page and verify the image persists

### 3. Test Image Serving
1. Check that uploaded images are accessible via `/uploads/profiles/` URLs
2. Verify images load correctly in the profile page

## File Structure

```
backend/
├── prisma/
│   └── schema.prisma (updated Profile model)
├── scripts/
│   └── add-profile-image-migration.sql (database migration)
├── src/
│   ├── index.ts (new upload endpoint + static serving)
│   └── lib/
│       └── database.ts (updated profile service)
└── uploads/
    └── profiles/ (profile images stored here)

frontend/
├── app/
│   └── api/
│       └── profile/
│           └── upload-image/
│               └── route.ts (new API route)
├── lib/
│   └── api-service.ts (updated with upload method)
└── app/
    └── profile/
        └── page.tsx (updated image handling)
```

## Error Handling

The implementation includes comprehensive error handling:
- File type validation (images only)
- File size validation (max 5MB)
- Upload failure fallback for development mode
- Proper error messages for users

## Security Considerations

- File type validation prevents malicious uploads
- File size limits prevent abuse
- Authentication required for all uploads
- Files are stored with unique names to prevent conflicts
- Static file serving is properly configured

## Future Improvements

1. **Cloud Storage**: Consider moving to AWS S3 or similar for production
2. **Image Processing**: Add image resizing and optimization
3. **CDN**: Use a CDN for better image delivery performance
4. **Backup**: Implement backup strategy for uploaded images

## Troubleshooting

### Common Issues

1. **Migration fails**: Check database permissions and connection
2. **Upload fails**: Verify file permissions on uploads directory
3. **Images not loading**: Check static file serving configuration
4. **CORS errors**: Verify CORS settings for file uploads

### Debug Steps

1. Check browser console for errors
2. Check backend logs for upload issues
3. Verify database column exists
4. Test endpoints with Postman or similar tool 