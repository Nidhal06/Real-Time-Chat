import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { FieldValue } from 'firebase-admin/firestore';
import { getFirebaseAuth, getFirestore } from './config/firebase';
import {
  buildMemberSnapshot,
  MemberStore,
  StoredMember,
  normalizeMemberStore,
  timestampToIsoString,
} from './utils/firestore';

interface ServerToClientEvents {
  new_message: (payload: MessagePayload) => void;
  message_history: (payload: MessagePayload[]) => void;
  room_users: (payload: { roomId: string; users: StoredMember[] }) => void;
  notification: (payload: { roomId?: string; message: string }) => void;
}

interface ClientToServerEvents {
  send_message: (payload: { roomId: string; content: string }) => void;
  join_room: (payload: { roomId: string }) => void;
  leave_room: (payload: { roomId: string }) => void;
}

interface InterServerEvents {}

interface SocketData {
  user?: AuthUser;
  rooms?: Set<string>;
}

type RoomVisibility = 'public' | 'private';

type RoomRecord = {
  members?: MemberStore;
  admins?: MemberStore;
  passwordHash?: string;
  type?: RoomVisibility;
};

type MessageRecord = {
  roomId: string;
  content: string;
  sender: StoredMember;
  createdAt?: FirebaseFirestore.Timestamp;
};

interface MessagePayload {
  id: string;
  room: string;
  content: string;
  sender: StoredMember;
  createdAt: string;
}

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

type PresenceEntry = {
  member: StoredMember;
  sockets: Set<string>;
};

const roomPresence = new Map<string, Map<string, PresenceEntry>>();
const db = getFirestore();
const firebaseAuth = getFirebaseAuth();
const roomsCollection = db.collection<RoomRecord>('rooms');
const messagesCollection = db.collection<MessageRecord>('messages');

const formatMessage = (
  doc: FirebaseFirestore.DocumentSnapshot<MessageRecord>
): MessagePayload => {
  const data = doc.data();

  if (!data) {
    throw new Error('Message data missing');
  }

  return {
    id: doc.id,
    room: data.roomId,
    content: data.content,
    sender: {
      ...data.sender,
      role: data.sender.role ?? 'member',
    },
    createdAt: timestampToIsoString(data.createdAt ?? null),
  };
};

const emitRoomUsers = (io: TypedServer, roomId: string): void => {
  const usersMap = roomPresence.get(roomId);
  const users = usersMap ? Array.from(usersMap.values()).map((entry) => entry.member) : [];
  io.to(roomId).emit('room_users', { roomId, users });
};

const trackPresence = (roomId: string, member: StoredMember, socketId: string): void => {
  if (!roomPresence.has(roomId)) {
    roomPresence.set(roomId, new Map());
  }

  const usersMap = roomPresence.get(roomId)!;
  const existing = usersMap.get(member.id);

  if (existing) {
    existing.sockets.add(socketId);
    return;
  }

  usersMap.set(member.id, { member, sockets: new Set([socketId]) });
};

const removePresence = (roomId: string, userId: string, socketId: string): void => {
  const usersMap = roomPresence.get(roomId);
  if (!usersMap) {
    return;
  }

  const entry = usersMap.get(userId);
  if (!entry) {
    return;
  }

  entry.sockets.delete(socketId);

  if (entry.sockets.size === 0) {
    usersMap.delete(userId);
  }

  if (usersMap.size === 0) {
    roomPresence.delete(roomId);
  }
};

const resolveMemberProfile = (
  room: { members?: MemberStore; admins?: MemberStore },
  user: AuthUser
): StoredMember => {
  const { map: memberMap } = normalizeMemberStore(room.members, 'member');
  const { map: adminMap } = normalizeMemberStore(room.admins, 'admin');
  const existing = memberMap[user.id];
  if (existing) {
    return existing;
  }

  return buildMemberSnapshot(user, adminMap[user.id] ? 'admin' : 'member');
};

const extractToken = (socket: any): string | null => {
  const authHeader = socket.handshake.auth?.token || socket.handshake.headers.authorization;

  if (!authHeader) {
    return null;
  }

  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  if (typeof authHeader === 'string') {
    return authHeader;
  }

  return null;
};

export const initializeSocket = (server: HttpServer): TypedServer => {
  const allowedOrigins = process.env.CLIENT_URL?.split(',').map((origin) => origin.trim()) ?? ['http://localhost:5173'];

  const io: TypedServer = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const token = extractToken(socket);

    if (!token) {
      next(new Error('Unauthorized'));
      return;
    }

    try {
      const decoded = await firebaseAuth.verifyIdToken(token);
      socket.data.user = {
        id: decoded.uid,
        name: decoded.name ?? decoded.email ?? 'Anonymous',
        email: decoded.email ?? 'unknown@example.com',
        avatar: decoded.picture ?? null,
      };
      socket.data.rooms = new Set();
      next();
    } catch (error) {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;

    if (!user) {
      socket.disconnect();
      return;
    }

    socket.on('join_room', async ({ roomId }) => {
      try {
        if (!roomId) {
          socket.emit('notification', { message: 'Room id missing' });
          return;
        }

        const roomRef = roomsCollection.doc(roomId);
        const snapshot = await roomRef.get();

        if (!snapshot.exists) {
          socket.emit('notification', { roomId, message: 'Room not found' });
          return;
        }

        const roomData = snapshot.data() as RoomRecord;
        const { map: memberMap, mutated: membersMutated } = normalizeMemberStore(roomData.members, 'member');
        const { map: adminMap, mutated: adminsMutated } = normalizeMemberStore(roomData.admins, 'admin');

        if (membersMutated || adminsMutated) {
          await roomRef.set(
            {
              ...(membersMutated ? { members: memberMap } : {}),
              ...(adminsMutated ? { admins: adminMap } : {}),
            },
            { merge: true }
          );
        }

        roomData.members = memberMap;
        roomData.admins = adminMap;

        const isMember = Boolean(memberMap[user.id]);
        const requiresPassword = Boolean(roomData.passwordHash);

        if (!isMember) {
          if (requiresPassword) {
            socket.emit('notification', {
              roomId,
              message: 'Please join this private room from the Rooms screen before connecting.',
            });
            return;
          }

          const newMemberSnapshot = buildMemberSnapshot(user, adminMap[user.id] ? 'admin' : 'member');
          memberMap[user.id] = newMemberSnapshot;
          await roomRef.set(
            {
              members: memberMap,
              updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
        }

        const memberProfile = resolveMemberProfile(roomData, user);
        await socket.join(roomId);
        socket.data.rooms?.add(roomId);
        trackPresence(roomId, memberProfile, socket.id);
        emitRoomUsers(io, roomId);

        try {
          const historySnapshot = await messagesCollection
            .where('roomId', '==', roomId)
            .orderBy('createdAt', 'asc')
            .limit(100)
            .get();

          socket.emit('message_history', historySnapshot.docs.map(formatMessage));
        } catch (historyError) {
          console.error('Failed to load message history', historyError);
          socket.emit('notification', {
            roomId,
            message: 'Joined room, but failed to load previous messages.',
          });
        }
      } catch (error) {
        console.error('join_room handler failed', error);
        socket.emit('notification', { roomId, message: 'Failed to join room' });
      }
    });

    socket.on('leave_room', async ({ roomId }) => {
      if (!roomId) {
        return;
      }

      socket.leave(roomId);
      socket.data.rooms?.delete(roomId);
      removePresence(roomId, user.id, socket.id);
      emitRoomUsers(io, roomId);
    });

    socket.on('send_message', async ({ roomId, content }) => {
      const trimmed = content?.trim();
      if (!roomId || !trimmed) {
        return;
      }

      try {
        const roomRef = roomsCollection.doc(roomId);
        const snapshot = await roomRef.get();

        if (!snapshot.exists) {
          socket.emit('notification', { roomId, message: 'Room not found' });
          return;
        }

        const roomData = snapshot.data() as RoomRecord;
        const { map: memberMap, mutated: membersMutated } = normalizeMemberStore(roomData.members, 'member');
        const { map: adminMap, mutated: adminsMutated } = normalizeMemberStore(roomData.admins, 'admin');

        if (membersMutated || adminsMutated) {
          await roomRef.set(
            {
              ...(membersMutated ? { members: memberMap } : {}),
              ...(adminsMutated ? { admins: adminMap } : {}),
            },
            { merge: true }
          );
        }

        if (!memberMap[user.id]) {
          try {
            const freshSnapshot = buildMemberSnapshot(user, adminMap[user.id] ? 'admin' : 'member');
            memberMap[user.id] = freshSnapshot;
            await roomRef.set(
              {
                members: memberMap,
                updatedAt: FieldValue.serverTimestamp(),
              },
              { merge: true }
            );
          } catch (membershipError) {
            console.error('Failed to heal membership before sending', membershipError);
            socket.emit('notification', {
              roomId,
              message: 'Join the room before sending messages',
            });
            return;
          }
        }

        const role = adminMap[user.id] ? 'admin' : 'member';
        const messageRef = await messagesCollection.add({
          roomId,
          content: trimmed,
          sender: buildMemberSnapshot(user, role),
          createdAt: FieldValue.serverTimestamp(),
        });

        const persisted = await messageRef.get();
        const payload = formatMessage(persisted);
        io.to(roomId).emit('new_message', payload);
      } catch (error) {
        socket.emit('notification', { roomId, message: 'Unable to send message' });
      }
    });

    socket.on('disconnect', () => {
      const rooms = Array.from(socket.data.rooms ?? []);
      rooms.forEach((roomId) => {
        removePresence(roomId, user.id, socket.id);
        emitRoomUsers(io, roomId);
      });
    });
  });

  return io;
};
