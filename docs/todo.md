# Cartmate Implementation TODO

## Project Overview

Real-time collaborative shopping list app with chat functionality.

- Tech: Next.js App Router, Prisma + NeonDB, Redis, WebSockets, JWT Auth
- Language: JavaScript (JSDoc, no TypeScript)

---

## Phase 1: Database & Core Infrastructure ✅ IN PROGRESS

### 1.1 Database Schema & Setup

- [x] Define Prisma schema with all models
  - [x] User model (id, username, email, passwordHash, avatarUrl)
  - [x] List model (id, name, creatorId, timestamps)
  - [x] ListMember model (id, listId, userId, role, joinedAt)
  - [x] Item model (id, listId, name, quantity, notes, done, createdBy)
  - [x] Message model (id, listId, senderId, text, mentions)
  - [x] Invite model (id, listId, token, expiresAt)
  - [x] MemberRole enum (CREATOR, EDITOR, VIEWER)
- [ ] Run Prisma migration to create database tables
- [ ] Generate Prisma client
- [ ] Create database connection utility (`lib/db.js`)
- [ ] Test database connection

### 1.2 Authentication Utilities

- [ ] Create JWT helpers (`lib/auth/jwt.js`)
  - [ ] Sign JWT with httpOnly cookie
  - [ ] Verify JWT from cookie
  - [ ] Refresh token logic
- [ ] Create password utilities (`lib/auth/password.js`)
  - [ ] Hash password with bcrypt
  - [ ] Verify password
- [ ] Create auth middleware (`middleware.js`)
  - [ ] Protect API routes
  - [ ] Protect pages (redirect to login)
  - [ ] Extract user from JWT

### 1.3 Validation Schemas (Zod)

- [ ] Create validation schemas (`lib/validations/`)
  - [ ] Auth schemas (register, login, password reset)
  - [ ] List schemas (create, update, invite)
  - [ ] Item schemas (create, update, toggle done)
  - [ ] Message schemas (send, mentions)
  - [ ] User schemas (update profile, avatar)

---

## Phase 2: Authentication & User Management

### 2.1 Auth API Routes

- [ ] `/api/auth/register` - User registration
  - [ ] Validate input (username, email, password)
  - [ ] Check if user exists
  - [ ] Hash password
  - [ ] Create user in DB
  - [ ] Issue JWT token
- [ ] `/api/auth/login` - User login
  - [ ] Validate credentials
  - [ ] Verify password
  - [ ] Issue JWT token
- [ ] `/api/auth/logout` - User logout
  - [ ] Clear JWT cookie
- [ ] `/api/auth/me` - Get current user
  - [ ] Return user data from JWT
- [ ] `/api/auth/reset-password` - Password reset flow
  - [ ] Request reset (send email)
  - [ ] Verify reset token
  - [ ] Update password

### 2.2 Profile Management

- [ ] `/api/profile` - Update user profile
  - [ ] Update username
  - [ ] Update email
  - [ ] Change password
- [ ] `/api/profile/avatar` - Upload profile image
  - [ ] Integrate UploadThings
  - [ ] Validate file size (<1MB)
  - [ ] Save avatar URL to DB

---

## Phase 3: List Management

### 3.1 List CRUD API Routes

- [ ] `/api/lists` - List management
  - [ ] GET - Fetch all lists for current user
  - [ ] POST - Create new list
    - [ ] Create list record
    - [ ] Add creator as ListMember with CREATOR role
- [ ] `/api/lists/[listId]` - Single list operations
  - [ ] GET - Fetch list details + items + members + messages
  - [ ] PATCH - Update list name (creator only)
  - [ ] DELETE - Delete list (creator only)

### 3.2 List Member Management

- [ ] `/api/lists/[listId]/members` - Member operations
  - [ ] GET - Fetch all members
  - [ ] DELETE - Remove member (creator only)
  - [ ] PATCH - Update member role (creator only)

### 3.3 Invite System

- [ ] `/api/lists/[listId]/invites` - Invite management
  - [ ] POST - Generate invite token
    - [ ] Create invite with expiry (24h default)
    - [ ] Return invite URL
  - [ ] GET - List active invites
  - [ ] DELETE - Revoke invite
- [ ] `/api/invites/[token]/accept` - Accept invite
  - [ ] Validate token (check expiry)
  - [ ] Add user to ListMember with EDITOR role
  - [ ] Delete invite token

---

## Phase 4: Items & Shopping List

### 4.1 Item CRUD API Routes

- [ ] `/api/lists/[listId]/items` - Item operations
  - [ ] GET - Fetch all items for list
  - [ ] POST - Add new item
    - [ ] Validate input (name, quantity, notes)
    - [ ] Save to DB
    - [ ] Publish to Redis for real-time sync
- [ ] `/api/lists/[listId]/items/[itemId]` - Single item
  - [ ] PATCH - Update item
    - [ ] Update name/quantity/notes
    - [ ] Publish to Redis
  - [ ] DELETE - Delete item
    - [ ] Remove from DB
    - [ ] Publish to Redis
- [ ] `/api/lists/[listId]/items/[itemId]/toggle` - Toggle done status
  - [ ] Update done field
  - [ ] Publish to Redis

---

## Phase 5: Chat & Messaging

### 5.1 Message API Routes

- [ ] `/api/lists/[listId]/messages` - Message operations
  - [ ] GET - Fetch messages (paginated, 50 per page)
  - [ ] POST - Send message
    - [ ] Parse @mentions (users & items)
    - [ ] Save to DB
    - [ ] Publish to Redis
    - [ ] Trigger email notifications for mentions

### 5.2 Mention System

- [ ] Parse @username mentions
- [ ] Parse @item mentions
- [ ] Store mentions in DB (mentionsUsers[], mentionsItems[])
- [ ] Send email notifications via Mailgun
  - [ ] Create Mailgun helper (`lib/email.js`)
  - [ ] Email template for mentions

---

## Phase 6: Real-Time Sync (WebSockets + Redis)

### 6.1 Redis Setup

- [ ] Create Redis client (`lib/redis.js`)
  - [ ] Connection pooling
  - [ ] Pub/Sub helper functions
- [ ] Define Redis channels
  - [ ] `list:{listId}:items` - Item updates
  - [ ] `list:{listId}:messages` - New messages
  - [ ] `list:{listId}:members` - Member changes
- [ ] Create cache helpers
  - [ ] Cache list data
  - [ ] Cache member status (online/offline)
  - [ ] Invalidate cache on updates

### 6.2 WebSocket Server

- [ ] Create WS server (`lib/ws/server.js`)
  - [ ] JWT authentication on handshake
  - [ ] Room/channel management (list-based)
  - [ ] Subscribe to Redis channels
  - [ ] Broadcast to connected clients
- [ ] WS event handlers
  - [ ] Join list room
  - [ ] Leave list room
  - [ ] Send real-time item updates
  - [ ] Send real-time messages
  - [ ] Send member status updates
- [ ] Implement "fast path + slow path" model
  - [ ] Optimistic updates (client-side)
  - [ ] Debounced DB writes (server-side)
  - [ ] Reconciliation on conflict

### 6.3 Client-Side WebSocket

- [ ] Create WS client hook (`hooks/useWebSocket.js`)
  - [ ] Connect to WS server
  - [ ] Subscribe to list updates
  - [ ] Handle reconnection
  - [ ] Sync state on reconnect

---

## Phase 7: UI Components (shadcn/ui)

### 7.1 Layout Components

- [ ] Create app layout (`app/layout.js`)
  - [ ] Import fonts (Oxanium, Source Code Pro)
  - [ ] Global styles
  - [ ] Toast provider
- [ ] Header/Nav component (`components/layout/Header.js`)
  - [ ] Logo
  - [ ] Profile dropdown (Profile, Settings, Logout)
  - [ ] Notification badge
- [ ] Toast/Alert layer (use shadcn Toast)

### 7.2 Auth Pages

- [ ] Login page (`app/(auth)/login/page.js`)
  - [ ] Email & password fields
  - [ ] Link to register & password reset
- [ ] Register page (`app/(auth)/register/page.js`)
  - [ ] Username, email, password, confirm password
  - [ ] Redirect to dashboard after success
- [ ] Password reset page (`app/(auth)/reset-password/page.js`)
  - [ ] Request reset form
  - [ ] Reset form with token

### 7.3 Dashboard

- [ ] Dashboard page (`app/dashboard/page.js`)
  - [ ] My Lists section (card view)
  - [ ] Create new list button
  - [ ] Pending invites section
- [ ] List card component (`components/list/ListCard.js`)
  - [ ] List name
  - [ ] Member count
  - [ ] Last updated timestamp

### 7.4 List Collaboration View

- [ ] List page (`app/lists/[listId]/page.js`)
  - [ ] Three-panel layout
- [ ] Left panel: Members (`components/list/MembersList.js`)
  - [ ] Avatar
  - [ ] Online status
  - [ ] Creator badge
  - [ ] Kick/role actions (creator only)
- [ ] Center panel: Items (`components/list/ItemsList.js`)
  - [ ] List title (editable)
  - [ ] Item list with checkboxes
  - [ ] Add item button
  - [ ] Item component (name, quantity, notes, done toggle)
- [ ] Right panel: Chat (`components/chat/ChatPanel.js`)
  - [ ] Message list (scrollable)
  - [ ] Highlight mentions
  - [ ] Input with @mention autocomplete
  - [ ] Send button

### 7.5 Profile & Settings

- [ ] Profile page (`app/profile/page.js`)
  - [ ] Avatar upload
  - [ ] Edit username & email
  - [ ] Change password
- [ ] Settings page (minimal)
  - [ ] Theme toggle (dark/light)
  - [ ] Notification preferences

### 7.6 Invite Flow

- [ ] Invite accept page (`app/invite/[token]/page.js`)
  - [ ] If logged in → auto-join
  - [ ] If not logged in → redirect to login/register → auto-join

---

## Phase 8: Animations & Polish (framer-motion)

- [ ] Add page transitions
- [ ] Item add/delete animations
- [ ] Message send animations
- [ ] Toast animations
- [ ] Loading states
- [ ] Skeleton loaders

---

## Phase 9: Email Notifications (Mailgun)

- [ ] Set up Mailgun client (`lib/email.js`)
- [ ] Email templates
  - [ ] Invite email
  - [ ] Mention notification
  - [ ] Password reset
- [ ] Background job queue (optional, or inline)

---

## Phase 10: Testing & Deployment

### 10.1 Testing

- [ ] Test auth flow (register, login, logout)
- [ ] Test list creation & membership
- [ ] Test invite flow
- [ ] Test item CRUD operations
- [ ] Test chat & mentions
- [ ] Test real-time sync across multiple clients
- [ ] Test offline/reconnection handling

### 10.2 Performance Optimization

- [ ] Redis caching for list data
- [ ] Debounce item updates
- [ ] Lazy load chat messages (pagination)
- [ ] Optimize WS message size

### 10.3 Deployment

- [ ] Environment variables setup
- [ ] Deploy to Vercel/Production
- [ ] Run Prisma migrations on production DB
- [ ] Configure Redis in production
- [ ] Set up WebSocket server (separate or serverless)

---

## Future Enhancements (Post-MVP)

### Nice-to-Have Features

- [ ] Item categories/tags
- [ ] Duplicate/clone lists
- [ ] Archive completed lists
- [ ] Export/print list
- [ ] Threaded chat replies
- [ ] Typing indicators
- [ ] Push notifications (browser)
- [ ] Offline mode with sync

### Advanced Features

- [ ] Read-only role enforcement
- [ ] Completion streaks
- [ ] Top contributor stats
- [ ] Barcode scanning
- [ ] Recipe import
- [ ] AI suggestions

---

## Current Progress Summary

✅ **Completed:**

- Prisma schema defined with all models
- Dependencies installed
- shadcn/ui initialized
- Custom CSS theme configured

🚧 **In Progress:**

- Database migration & client generation

⏳ **Next Up:**

- Create database utilities
- Build auth system
- Implement core API routes

---

## Notes & Reminders

- **JWT stored in httpOnly cookies** for security
- **Optimistic UI** for instant feedback
- **Fast path (WS) + slow path (DB)** for performance
- **Dynamic invite URLs** using `window.location.origin`
- **Pagination** for chat (50 messages)
- **Debounce** item edits (1-2 seconds)
- **Email notifications** for mentions only
- **File size limit** for avatars: <1MB

---

**Last Updated:** {{ timestamp }}
