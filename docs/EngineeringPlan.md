# Cartmate – High-Level Engineering Procedure & Techniques

This document outlines the **technical approach, flow, and architecture** for building Cartmate using the chosen stack.

---

## 🔹 Tech Stack Recap

- **Frontend**: Next.js (App Router) + shadcn/ui + framer-motion (for UI/animations)
- **Language**: JavaScript (JSDoc, no TypeScript)
- **Database**: NeonDB (PostgreSQL) for persistence
- **Cache/Realtime**: Redis (for caching, pub/sub, WS fan-out)
- **Realtime**: WebSockets (WS)
- **Auth**: JWT-based sessions
- **File Uploads**: uploadThings (profile images <1MB)
- **Email**: Mailgun API (for invites & notifications)

---

## 🔹 High-Level Flow & Procedures

### 1. Authentication & Session

- JWT stored in **httpOnly cookies** for security.
- Login/Register → JWT issued after validation.
- Middleware in Next.js to protect API routes and WS handshake.

### 2. Database Schema (simplified)

**Users**

- `id, username, email, password_hash, avatar_url`

**Lists**

- `id, name, creator_id, created_at`

**ListMembers**

- `id, list_id, user_id, role (creator|editor|viewer), joined_at`

**Items**

- `id, list_id, name, quantity, notes, done, created_by, updated_at`

**Messages**

- `id, list_id, sender_id, text, mentions_users[], mentions_items[], created_at`

**Invites**

- `id, list_id, token (uuid), expires_at, created_at`

---

### 3. Real-Time with WS + Redis

- **WS connection** established after login (JWT verified).
- Each list = WS channel (room).
- Redis Pub/Sub used for broadcasting:

  - Item updates (add/edit/delete/done)
  - Chat messages
  - Member join/leave

**Flow**:

1. User performs action (e.g., add item).
2. Optimistic update on client state.
3. API call saves to PostgreSQL.
4. After DB commit → publish event via Redis.
5. WS server receives → fan-out to all clients in that list channel.
6. Other clients update state instantly.

---

### 4. Conflict Handling

- **Optimistic UI**: Client assumes success, then reconciles on server ack.
- **Conflict rules**:

  - Last writer wins for simple text fields (e.g., item name).
  - Append-only for chat (no conflict).
  - Timestamps in DB used to resolve collisions.

- **Reconciliation**: If server rejects (e.g., validation), client rolls back optimistic change.

---

### 5. The Real Technique (for Cartmate)

Cartmate will use the same principle as collaborative editors but scoped to shopping lists and chats.

- **Local + WS First (fast path)**

  - Item edits or chat messages are first applied locally and sent over WS.
  - Other members see updates instantly via WS broadcast.
  - No DB hit yet for micro-changes (e.g., when typing a long item name).

- **DB Writes (slow path)**

  - Changes are batched/debounced before writing to Postgres.
  - Example: save after 1–2 seconds of inactivity or once an item is confirmed.
  - Reduces DB load and latency.

- **Conflict Resolution Layer**

  - For items: last writer wins unless explicitly locked (optional future feature).
  - For chat: append-only, so no conflict.
  - Timestamps resolve conflicts if two edits hit the same item.

- **Resync on Reconnect**

  - When a member rejoins a list, the latest list state + chat history is fetched from Postgres.
  - Then WS re-subscribes for live updates.

This ensures **Cartmate stays responsive** even under heavy edits and avoids overwhelming NeonDB.

---

### 6. Invitations (Dynamic URL)

- Invite link = `currentOrigin + "/invite/" + token`

  - Use `window.location.origin` on client to construct, never hardcode.

- Flow:

  1. Creator generates invite token (stored in DB with expiry).
  2. URL shared → e.g., `https://cartmate.com/invite/<token>`
  3. If user not logged in → redirect to login → auto-join after auth.

---

### 7. Notifications

- **Toast (in-app)** → via WS event (e.g., mention, item updated).
- **Email (Mailgun)**:

  - On mentions → send background job via worker.
  - Config from env:

    - `MAILGUN_API_KEY`
    - `MAILGUN_DOMAIN`
    - `MAILGUN_FROM_EMAIL`

---

### 8. File Uploads

- UploadThings integration for profile avatar.
- Client → UploadThings signed URL → storage.
- Store only URL reference in PostgreSQL.
- Enforce <1MB check client + server side.

---

### 9. Performance & Responsiveness

- Redis cache for frequently accessed data (list members, items snapshot).
- Use `LISTEN/NOTIFY` in Postgres if needed for DB-triggered events.
- Debounce item edits to prevent WS flooding.
- Use pagination/lazy load in chat (load 50 msgs, fetch more on scroll).

---

## 🔹 Chronology of Saving & Sync

1. **User action** → UI state updated optimistically (fast path).
2. **Debounced save** → Changes batched and persisted to Postgres (slow path).
3. **After commit** → Redis publish event.
4. **WS broadcast** → All connected members update.
5. **Clients reconcile** → Confirm or rollback change if conflict.

---

## 🔹 Future-Proofing Hooks

- Add `roles` field for read-only members.
- Extend `items` with categories/tags.
- Add archived lists table.
- Gamification tables for stats & streaks.

---

✅ This adjusted plan makes Cartmate real-time, avoids DB overload, and ensures smooth UX with fast local updates and reliable persistence.
