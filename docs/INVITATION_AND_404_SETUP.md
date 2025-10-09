# Invitation System & 404 Page Setup

## Overview

This document describes the secure invitation system and custom 404 page implemented for Cartmate.

## Features Implemented

### 1. Custom 404 Page (`/app/not-found.js`)

A user-friendly 404 error page that:
- Displays a clear error message
- Provides helpful context about why the error occurred
- Offers multiple navigation options (Dashboard, Go Back)
- Supports dark mode
- Has a responsive design

**Usage:** Automatically shown when users navigate to non-existent routes.

### 2. Invitation Page (`/app/invite/[token]/page.js`)

A secure page for handling list invitations that:
- Validates invitation tokens
- Checks authentication status
- Shows list details before joining
- Handles invite expiry and usage limits
- Provides clear error messages
- Redirects to login if not authenticated
- Redirects to list page after successful acceptance

**URL Format:** `http://localhost:3000/invite/[UUID-TOKEN]`

### 3. Invitation Details API (`/app/api/invites/[token]/details/route.js`)

A secure endpoint that:
- Requires authentication
- Fetches invitation and list details
- Validates token, expiry, and usage limits
- Checks if user is already a member
- Returns sanitized, safe information
- Does NOT accept the invite (read-only)

**Security Features:**
- Authentication required
- Returns only necessary public information
- Validates all invite constraints
- Prevents duplicate memberships

### 4. Enhanced Authentication Flow

Updated login and register pages to support redirect parameters:

**Login Page Updates:**
- Accepts `?redirect=/invite/[token]` query parameter
- Redirects to original destination after successful login
- Preserves redirect when linking to register page

**Register Page Updates:**
- Accepts `?redirect=/invite/[token]` query parameter
- Redirects to original destination after successful registration
- Preserves redirect when linking to login page

## User Flows

### Existing User Accepting Invite

1. User clicks invite link: `/invite/[token]`
2. System checks authentication
3. User is authenticated → Show invite details
4. User clicks "Accept Invitation"
5. System validates and adds user to list
6. Redirect to list page

### New User Accepting Invite

1. User clicks invite link: `/invite/[token]`
2. System checks authentication
3. User is NOT authenticated → Redirect to `/login?redirect=/invite/[token]`
4. User can either:
   - Login (redirects back to invite)
   - Click "Create account" (redirects to `/register?redirect=/invite/[token]`)
5. After authentication, return to invite page
6. User accepts invite
7. Redirect to list page

### Invite Validation States

The system handles multiple validation scenarios:

**Valid Invite:**
- Shows list details and accept button

**Invalid Token:**
- Error: "Invalid invite link. This invitation may have been deleted."

**Inactive Invite:**
- Error: "This invite link has been deactivated by the list creator."

**Expired Invite:**
- Error: "This invite has expired. Please ask for a new invite link."

**Max Uses Reached:**
- Error: "This invite has reached its maximum capacity. No more members can join."

**Already a Member:**
- Error: "You are already a member of this list."

## API Endpoints

### GET `/api/invites/[token]/details`
- **Purpose:** Fetch invite details without accepting
- **Auth:** Required
- **Returns:** Invite and list information
- **Status Codes:**
  - 200: Success
  - 401: Unauthorized
  - 404: Invalid token
  - 409: Already a member
  - 410: Inactive/expired/full

### POST `/api/invites/[token]/accept`
- **Purpose:** Accept invite and join list
- **Auth:** Required
- **Returns:** Member and list information
- **Status Codes:**
  - 200: Success
  - 401: Unauthorized
  - 404: Invalid token
  - 409: Already a member
  - 410: Inactive/expired/full

## Security Considerations

### Token Security
- Tokens are UUIDs (128-bit random values)
- Stored securely in database
- Validated on every request
- Can be deactivated by list creator

### Authentication
- All invite operations require authentication
- Prevents anonymous access
- JWT-based session validation

### Rate Limiting
- Max uses per invite (configurable)
- Expiry time limits (configurable)
- Manual deactivation option

### Data Sanitization
- Only necessary information returned
- No sensitive user data exposed
- Member counts shown for transparency

## Testing the Features

### Test 404 Page
1. Navigate to any non-existent route (e.g., `/this-does-not-exist`)
2. Verify 404 page displays correctly
3. Test "Go to Dashboard" button
4. Test "Go Back" button

### Test Invitation Flow (Authenticated User)
1. Create a list (as creator)
2. Generate an invite link
3. Copy invite link
4. Open in browser (while logged in)
5. Verify list details are shown
6. Click "Accept Invitation"
7. Verify redirect to list page

### Test Invitation Flow (Unauthenticated User)
1. Get an invite link
2. Open in incognito/private window
3. Verify redirect to login
4. Login or register
5. Verify redirect back to invite
6. Accept invite
7. Verify redirect to list page

### Test Invite Validation
1. Try accepting same invite twice → Already a member error
2. Try expired invite → Expired error
3. Try deactivated invite → Deactivated error
4. Try invalid token → Invalid error

## Files Created/Modified

### New Files
- `/app/invite/[token]/page.js` - Invitation page
- `/app/not-found.js` - Custom 404 page
- `/app/api/invites/[token]/details/route.js` - Invite details API

### Modified Files
- `/app/(auth)/login/page.js` - Added redirect parameter support
- `/app/(auth)/register/page.js` - Added redirect parameter support

## Next Steps

Consider implementing:
1. Email notifications for invites
2. Invite analytics (views, accepts)
3. Custom invite messages
4. Role selection during invite creation
5. Batch invites via email
6. QR code generation for invites

