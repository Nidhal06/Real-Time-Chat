# Real-Time Chat Application ⚡️

**Realtime chat app with Firebase-backed persistence and auth, Socket.IO for live messaging, and a React + Vite frontend.**

---

## 🚀 Overview

This repository implements a full-stack realtime chat application:

- Backend: Node.js + Express + TypeScript using the Firebase Admin SDK (Firestore) for data and Firebase Auth for authentication. Socket.IO provides realtime messaging and presence.
- Frontend: React + Vite + TypeScript using the Firebase Web SDK for authentication, Axios for REST calls, and Socket.IO client for realtime updates.

Key features:

- Create, list, join, and leave chat rooms (public or private)
- Password-protected private rooms with invitation-by-email flow
- Realtime messaging (Socket.IO) and message history (Firestore)
- Invitation links that let invited users accept access without a room password

---

## 🧭 Tech Stack

- Backend: Node.js, Express, TypeScript, Firebase Admin (Firestore & Auth), Socket.IO, Nodemailer
- Frontend: React, TypeScript, Vite, Firebase Web SDK, Socket.IO client, Styled Components

---

## 📁 Project Structure

```
root/
├── Backend/                # Express + Socket.IO server
│   ├── src/
│   │   ├── config/         # Firebase initialization (service account)
│   │   ├── controllers/    # REST endpoints logic
│   │   ├── middleware/     # auth + error handling
│   │   ├── routes/         # API route definitions
│   │   ├── utils/          # helpers (email, firestore helpers)
│   │   ├── socket.ts       # Socket.IO handlers
│   │   └── server.ts       # app + server bootstrap
│   └── package.json
├── Frontend/               # React client
│   ├── src/
│   │   ├── api/            # axios instance (auth token injection)
│   │   ├── context/        # Auth context using Firebase
│   │   ├── components/     # UI components (ChatBox, modals…)
│   │   └── pages/          # App pages (Rooms, ChatRoom, Invite accept…)
│   └── package.json
└── README.md
```

---

## 🔧 Environment & Configuration

### Backend (.env)

The backend uses the Firebase Admin SDK and an SMTP transporter to send invitations. Create a `.env` file in `Backend/` with the following variables:

- FIREBASE_PROJECT_ID
- FIREBASE_CLIENT_EMAIL
- FIREBASE_PRIVATE_KEY (use literal newlines encoded as `\n` when storing in .env)
- FIREBASE_STORAGE_BUCKET (optional)
- CLIENT_URL (comma-separated allowed origins, e.g. `http://localhost:5173`)
- PORT (default: 5000)
- SMTP_HOST
- SMTP_PORT (default: 587)
- SMTP_USER
- SMTP_PASS
- SMTP_SECURE (set to `true` if using SMTPS)
- INVITE_EMAIL_FROM (email address used as the "from" header for invites)

Example (use your values):

```env
PORT=5000
CLIENT_URL=http://localhost:5173
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=xxxx@xxxx.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nXXX\n-----END PRIVATE KEY-----\n"
INVITE_EMAIL_FROM="noreply@example.com"
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-pass
SMTP_SECURE=false
```

> Note: The app currently expects the Firebase service account values to be provided via environment variables (no local JSON file required).

### Frontend (.env)

Create a `.env` file in `Frontend/` to override defaults when needed:

- VITE_API_URL (e.g. `http://localhost:5000`)
- VITE_SOCKET_URL (optional; falls back to VITE_API_URL)
- VITE_FIREBASE_* (API key, auth domain, etc — the repo includes sensible defaults for local dev)

Example:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
```

---

## ▶️ Development (Run locally)

Backend

```bash
cd Backend
npm install
npm run dev
```

- Starts the server with `ts-node-dev` (watch + restart).

Frontend

```bash
cd Frontend
npm install
npm run dev
```

- Vite dev server runs (default `http://localhost:5173`).

Build for production

- Backend: `npm run build` then run `node dist/server.js` in `Backend`
- Frontend: `npm run build` in `Frontend` (Vite)

---

## 🔐 Authentication

- The frontend uses Firebase Authentication (Web SDK) for user sign-in.
- For REST API requests, the client sets an Authorization header: `Authorization: Bearer <Firebase ID token>`.
- For Socket.IO, the client passes the same ID token in the socket `auth` payload (see `ChatRoom.tsx`).
- The backend verifies tokens using the Firebase Admin SDK and populates `req.user` with a normalized user object.

---

## 📡 API Endpoints (summary)

All endpoints are prefixed with `/api` (axios client is configured to attach `/api`).

Auth

- GET /api/auth/me — Get current authenticated user (requires Authorization header)

Rooms

- GET /api/rooms — List all rooms (auth required)
- POST /api/rooms — Create a room (auth required)
- POST /api/rooms/:roomId/join — Join a room (supply password for private rooms)
- POST /api/rooms/:roomId/leave — Leave a room
- POST /api/rooms/:roomId/invitations — Send invitations by email (admin only)

Messages

- GET /api/messages/:roomId — Get messages for a room (auth + membership required)
- POST /api/messages/:roomId — Send a message via REST (socket endpoint exists; REST is also supported)

Invitations

- GET /api/invitations/:token — Fetch invitation details (no auth required)
- POST /api/invitations/:token/accept — Accept invitation (auth required; links invited email to the logged-in account)

---

## 🔁 Socket.IO (Realtime)

Connection

- Client connects with an auth token: io(url, { auth: { token } })
- Server validates Firebase ID token and populates socket.data.user

Client -> Server events

- join_room: { roomId }
- leave_room: { roomId }
- send_message: { roomId, content }

Server -> Client events

- message_history: Message[] — emitted upon joining a room
- new_message: Message — emitted to room when a message is created
- room_users: { roomId, users } — presence updates
- notification: { roomId?, message } — informational notices

Message shape

- { id, room, content, sender: { id, name, email, avatar?, role }, createdAt }

---

## ✉️ Invitation Flow

- Room admins can send invitation emails (up to 25 at once).
- Each invitation contains a unique token linked to the target email and room.
- When a recipient visits `/invite/accept/:token` they can view the invite; after signing in, the client POSTs to `/api/invitations/:token/accept` to add them to the room (bypassing password).
- Invitations auto-expire / become unusable if the room is deleted or the token is marked accepted.

---

## ⚠️ Notes & Caveats

- Although `Backend/src/config/db.ts` references `MONGO_URI`, the app uses Firestore for persistence — MongoDB/Mongoose are not used in the current code paths.
- Ensure `FIREBASE_PRIVATE_KEY` in your environment contains encoded newlines (`\n`) or read it from a secure file store if preferred.
- SMTP must be configured for invitation emails to be sent; for local testing you can use services like Mailtrap or an SMTP test server.

---

## 👩‍💻 Contributing

- Fork, create a feature branch, and open a PR with tests and a clear description.
- Keep environment-sensitive secrets out of the repo; use `.env` or a secrets manager.

---

## 📝 License

This project is provided under the MIT license (check the repository or add a LICENSE file if needed).

---

If you'd like, I can also add an example `.env.example` for the Backend and Frontend to make onboarding easier. ✅
