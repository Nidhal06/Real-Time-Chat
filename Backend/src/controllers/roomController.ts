import { FieldValue } from 'firebase-admin/firestore';
import { createHash } from 'crypto';
import { NextFunction, Response } from 'express';
import { getFirestore } from '../config/firebase';
import { AuthRequest } from '../middleware/auth';
import {
  buildMemberSnapshot,
  MemberStore,
  StoredMember,
  normalizeMemberStore,
  timestampToIsoString,
} from '../utils/firestore';

export type RoomRecord = {
  name: string;
  description?: string;
  type?: RoomVisibility;
  passwordHash?: string;
  members?: MemberStore;
  admins?: MemberStore;
  createdBy: StoredMember;
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
};

type RoomResponse = {
  id: string;
  name: string;
  description?: string;
  type: RoomVisibility;
  requiresPassword: boolean;
  members: StoredMember[];
  admins: StoredMember[];
  createdBy: StoredMember;
  createdAt: string;
  updatedAt: string;
};

type RoomVisibility = 'public' | 'private';

const normalizeRoomType = (value?: string): RoomVisibility =>
  value === 'private' ? 'private' : 'public';

const hashRoomPassword = (value: string): string =>
  createHash('sha256').update(value).digest('hex');

const normalizePasswordValue = (value?: string | null): string =>
  typeof value === 'string' ? value : '';

const db = getFirestore();
const roomsCollection = db.collection('rooms');

const serializeRoom = (doc: FirebaseFirestore.DocumentSnapshot<RoomRecord>): RoomResponse => {
  const data = doc.data();

  if (!data) {
    throw new Error('Room data missing');
  }

  const { list: members } = normalizeMemberStore(data.members, 'member');
  const { list: admins } = normalizeMemberStore(data.admins, 'admin');

  return {
    id: doc.id,
    name: data.name,
    description: data.description,
    type: data.type ?? 'public',
    requiresPassword: Boolean(data.passwordHash),
    members,
    admins,
    createdBy: {
      ...data.createdBy,
      role: data.createdBy.role ?? 'admin',
    },
    createdAt: timestampToIsoString(data.createdAt ?? null),
    updatedAt: timestampToIsoString(data.updatedAt ?? null),
  };
};

export const createRoom = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { name, description, type, password } = req.body as {
      name?: string;
      description?: string;
      type?: string;
      password?: string;
    };
    const trimmedName = name?.trim();
    const roomType = normalizeRoomType(type);
    const trimmedPassword = password?.trim();

    if (!trimmedName) {
      res.status(400).json({ message: 'Room name is required' });
      return;
    }

    if (roomType === 'private' && (!trimmedPassword || trimmedPassword.length < 4)) {
      res.status(400).json({ message: 'Private rooms require a password of at least 4 characters' });
      return;
    }

    const existingRoom = await roomsCollection.where('name', '==', trimmedName).limit(1).get();

    if (!existingRoom.empty) {
      res.status(409).json({ message: 'Room name already exists' });
      return;
    }

    const memberSnapshot = buildMemberSnapshot(req.user, 'admin');
    const passwordHash = roomType === 'private' && trimmedPassword ? hashRoomPassword(trimmedPassword) : undefined;

    const roomData: Record<string, unknown> = {
      name: trimmedName,
      description: description?.trim() || undefined,
      type: roomType,
      passwordHash,
      createdBy: memberSnapshot,
      members: {
        [memberSnapshot.id]: memberSnapshot,
      },
      admins: {
        [memberSnapshot.id]: memberSnapshot,
      },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (!passwordHash) {
      delete roomData.passwordHash;
    }

    const roomRef = await roomsCollection.add(roomData);

    const createdRoom = await roomRef.get();
    res.status(201).json(serializeRoom(createdRoom));
  } catch (error) {
    next(error);
  }
};

export const listRooms = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const snapshot = await roomsCollection.orderBy('createdAt', 'desc').get();
    const rooms = snapshot.docs.map(serializeRoom);
    res.status(200).json(rooms);
  } catch (error) {
    next(error);
  }
};

export const joinRoom = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { roomId } = req.params;
    const { password } = req.body as { password?: string };
    const roomRef = roomsCollection.doc(roomId);
    const snapshot = await roomRef.get();

    if (!snapshot.exists) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }

    const data = snapshot.data() as RoomRecord;
    const { map: memberMap, mutated: membersMutated } = normalizeMemberStore(data.members, 'member');
    const { map: adminMap, mutated: adminsMutated } = normalizeMemberStore(data.admins, 'admin');

    if (membersMutated || adminsMutated) {
      await roomRef.set(
        {
          ...(membersMutated ? { members: memberMap } : {}),
          ...(adminsMutated ? { admins: adminMap } : {}),
        },
        { merge: true }
      );
    }

    data.members = memberMap;
    data.admins = adminMap;

    const isMember = Boolean(memberMap[req.user.id]);
    const requiresPassword = Boolean(data.passwordHash);

    console.info('joinRoom attempt', {
      roomId,
      userId: req.user.id,
      requiresPassword,
      suppliedPassword: Boolean(password?.trim()),
      alreadyMember: isMember,
    });

    if (!isMember) {
      if (requiresPassword) {
        const trimmedPassword = password?.trim();

        if (!trimmedPassword) {
          console.warn('joinRoom missing password input', { roomId, userId: req.user.id });
          res.status(403).json({ message: 'Room password required' });
          return;
        }

        const hashedInput = hashRoomPassword(trimmedPassword);
        const storedValue = normalizePasswordValue(data.passwordHash);
        const passwordMatches = storedValue === hashedInput || storedValue === trimmedPassword;

        if (!passwordMatches) {
          console.warn('Room password mismatch', {
            roomId,
            storedPreview: storedValue.slice(0, 8),
            storedLength: storedValue.length,
            hashedPreview: hashedInput.slice(0, 8),
            providedLength: trimmedPassword.length,
            userId: req.user.id,
          });
          res.status(403).json({ message: 'Incorrect room password' });
          return;
        }

        if (storedValue !== hashedInput) {
          console.info('Upgrading stored password hash for room', { roomId });
          await roomRef.set({ passwordHash: hashedInput }, { merge: true });
          data.passwordHash = hashedInput;
        }
      }

      const newMemberSnapshot = buildMemberSnapshot(req.user, adminMap[req.user.id] ? 'admin' : 'member');
      memberMap[req.user.id] = newMemberSnapshot;
      await roomRef.set(
        {
          members: memberMap,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    const updatedSnapshot = await roomRef.get();
    res.status(200).json(serializeRoom(updatedSnapshot));
  } catch (error) {
    next(error);
  }
};

export const leaveRoom = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { roomId } = req.params;
    const roomRef = roomsCollection.doc(roomId);
    const snapshot = await roomRef.get();

    if (!snapshot.exists) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }

    const data = snapshot.data() as RoomRecord;
    const { map: memberMap, mutated } = normalizeMemberStore(data.members, 'member');

    if (mutated) {
      await roomRef.set({ members: memberMap }, { merge: true });
    }

    if (memberMap[req.user.id]) {
      await roomRef.update({
        [`members.${req.user.id}`]: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    const updatedSnapshot = await roomRef.get();
    res.status(200).json(serializeRoom(updatedSnapshot));
  } catch (error) {
    next(error);
  }
};
