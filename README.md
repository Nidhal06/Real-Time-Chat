# Real-Time Chat ⚡️

**A small, full-stack realtime chat app built with Firebase (Firestore + Auth), Socket.IO, Express + TypeScript, and a React + Vite frontend.**

---

## 🚀 Quick summary

- Realtime messaging powered by Socket.IO.
- Persistent data and auth handled by Firebase (Admin SDK on the server, Web SDK on the client).
- Private rooms support password protection and an invitation-by-email flow.
- Clean, TypeScript-first codebase split into `Backend/` and `Frontend/` for easy local development and deployment.

---

## ✅ Notable details (what I found)

- Backend uses the Firebase Admin SDK (Firestore and Auth) and Socket.IO for realtime features.
- The frontend ships *default demo Firebase config values* so the app can be run locally with minimal setup.
- `mongoose` appears in `Backend/package.json` but the codebase stores data in Firestore (no active Mongo usage).

---

## 📁 Repository layout

```
realtime-chat/
├─ Backend/        # Express + Socket.IO server (TypeScript)
│  ├─ src/
│  │  ├─ config/    # Firebase init
│  │  ├─ controllers/
│  │  ├─ middleware/
│  │  ├─ routes/
│  │  ├─ socket.ts
│  │  └─ server.ts
│  └─ package.json
├─ Frontend/       # React + Vite client (TypeScript)
│  ├─ src/
│  │  ├─ api/
│  │  ├─ components/
│  │  └─ pages/
│  └─ package.json
└─ README.md
```

---

## 🧰 Tech stack

- Backend: Node.js, Express, TypeScript, Firebase Admin (Firestore + Auth), Socket.IO, Nodemailer
- Frontend: React, TypeScript, Vite, Firebase Web SDK, Socket.IO client, Styled Components

---

## 🛠 Environment & configuration

Two `.env` files (one per project) are expected for local development. Keep secrets out of source control.

Backend (Backend/.env)

```env
PORT=5000
CLIENT_URL=http://localhost:5173
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=xxxx@xxxx.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
INVITE_EMAIL_FROM="noreply@example.com"
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-pass
SMTP_SECURE=false
```

Frontend (Frontend/.env)

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
```

Tip: The frontend already includes a set of demo `VITE_FIREBASE_*` values for quick local testing; replace them with your project's config for production.

---

## ▶️ Run locally

1. Start the backend

```bash
cd Backend
npm install
npm run dev
```

2. Start the frontend

```bash
cd Frontend
npm install
npm run dev
```

Default ports: Backend -> `5000`, Frontend (Vite) -> `5173`.

---

## 🔐 Auth & tokens

- Users sign in using Firebase Authentication (client-side Web SDK).
- The frontend stores the ID token and attaches it to REST requests (`Authorization: Bearer <token>`).
- Socket.IO connections pass the ID token in the `auth` payload when connecting; the server verifies it via Firebase Admin.

---

## 📡 API summary

Base path: `/api`

Auth
- GET `/api/auth/me` — returns the current authenticated user (auth required)

Rooms
- GET `/api/rooms` — list rooms
- POST `/api/rooms` — create a room
- POST `/api/rooms/:roomId/join` — join a room (provide password for private rooms)
- POST `/api/rooms/:roomId/leave` — leave a room
- POST `/api/rooms/:roomId/invitations` — send invites (admin only)

Messages
- GET `/api/messages/:roomId` — get room messages
- POST `/api/messages/:roomId` — send a message via REST

Invitations
- GET `/api/invitations/:token` — inspect invitation
- POST `/api/invitations/:token/accept` — accept invite (auth required)

(See `Backend/src/routes` for full routing details.)

---

## 🔁 Socket.IO (realtime)

Client connection: `io(SOCKET_URL, { auth: { token } })`

Client -> Server events
- `join_room` { roomId }
- `leave_room` { roomId }
- `send_message` { roomId, content }

Server -> Client events
- `message_history` — list of messages after join
- `new_message` — new message broadcast
- `room_users` — presence updates
- `notification` — informational messages

Messages include: `{ id, room, content, sender, createdAt }` where `sender` contains id/name/email/role.

---

## ✉️ Invitation flow

- Admins create/send invitation emails to one or more addresses.
- Recipient gets a token link to accept the invite; the client POSTs `/api/invitations/:token/accept` after signing in to add the user to the room (bypassing password).

---

## ⚠️ Notes & tips

- `Backend/package.json` includes `mongoose` but the repo currently uses Firestore — you can remove `mongoose` if not planning to add Mongo-based features.
- Keep `FIREBASE_PRIVATE_KEY` safe and use encoded newlines (`\n`) in `.env` files.
- For testing email, use Mailtrap or a similar service.

---

## ✅ Suggested next improvements

- Add `Backend/.env.example` and `Frontend/.env.example` files (I can add these on request).
- Add a `LICENSE` file if you want explicit licensing.
- Add simple integration tests for API and socket flows.

---

## 🙌 Contributing

- Fork → feature branch → PR. Add tests where applicable and avoid committing secrets.

---

## 📜 License

MIT (add `LICENSE` file to the repo to make this explicit)

---

If you'd like, I can create `Backend/.env.example` and `Frontend/.env.example` files, and add a short troubleshooting section to the README. ✅
