# Cartmate – UX & UI Outline (Mechanics & Layout)

This document outlines the **UX flow, UI structure, and state mechanisms** for the Cartmate app. Focus is purely on **layout, navigation, and interactions** – no styling details.

---

## 🔹 Global App Structure

- **Header/Nav (persistent)**

  - Logo / App name
  - Profile avatar → dropdown: Profile, Settings, Logout

- **Main Content Area (dynamic)**

  - Renders pages: Login/Register, Dashboard, List View, Profile

- **Toast/Alert Layer (global)**

  - For mentions, errors, success messages

---

## 🔹 Authentication Flow

1. **Login Page**

   - Fields: email, password
   - CTA: "Login"
   - Link: "Register" and "Forgot password?"

2. **Register Page**

   - Fields: username, email, password, confirm password
   - CTA: "Register"
   - Redirects → Dashboard after success

3. **Password Reset Flow**

   - Request email → reset link sent → new password form

---

## 🔹 Dashboard (Post-login)

- **Section: My Lists**

  - Card/list view of shopping lists owned/joined
  - Each card → shows name, members count, last updated
  - CTA: "Create new list"

- **Section: Invites**

  - Pending invites with accept/decline buttons

State:

- `lists[]` (user’s created + joined)
- `invites[]`

---

## 🔹 Shopping List View (Collaboration Screen)

**Layout:**

- **Left Panel:** List members

  - Shows avatars, status (online/last seen)
  - Creator badge
  - Member actions (kick, assign role)

- **Main Panel (center): Shopping list**

  - List title (editable if creator)
  - Items displayed in list form:

    - Item name, quantity, notes
    - Status: done/undone toggle
    - Edit/delete actions (all members)

  - CTA: “+ Add Item”

- **Right Panel: Chat**

  - Message list (scrollable)
  - Mentions highlight (@user, @item)
  - Input box with autocomplete for @mentions
  - Send button

State:

- `items[]` (name, qty, notes, done status, createdBy)
- `members[]` (id, username, role, status)
- `messages[]` (text, senderId, mentions[], itemRefs[])

Real-time Sync:

- Items, members, and messages update live via WS/RTDB.

---

## 🔹 Profile & Settings

- **Profile Page**

  - Avatar upload (<1mb)
  - Username (editable)
  - Email (editable)
  - Password reset/change

- **Settings (minimal)**

  - Notification preferences (email, toast)
  - Theme toggle (dark/light)

State:

- `user { id, username, email, avatar, preferences }`

---

## 🔹 UX Mechanisms

1. **Invitations**

   - Invite link → opens list join page
   - If logged in → auto-join
   - If not logged in → redirect to register/login → then auto-join

2. **Mentions**

   - Autocomplete when typing “@”
   - On send: parse & attach metadata (`mentions[]`)
   - Notification triggered: toast + email

3. **Notifications**

   - Toasts for mentions, item updates
   - Global badge (in nav) for unseen alerts
   - Emails for mentions

4. **State Handling**

   - Client state synced via server events
   - Optimistic UI (item appears before server confirm)
   - Error rollbacks if server rejects action

---

## 🔹 Future Expansion Hooks

- Categories/tags → extend `items[]`
- Archived lists → new `archivedLists[]`
- Roles → extend `members[]` with permissions
- Gamification → new `stats[]`

---

✅ This gives you a **barebones but complete UX+UI skeleton**:

- Global layout → Auth → Dashboard → List Collaboration → Profile.
- Each state and interaction defined clearly, no CSS fluff.
