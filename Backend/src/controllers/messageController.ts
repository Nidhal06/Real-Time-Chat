import { FieldValue } from 'firebase-admin/firestore';
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

type RoomRecord = {
  members?: MemberStore;
  admins?: MemberStore;
};

type MessageRecord = {
  roomId: string;
  content: string;
  sender: StoredMember;
  createdAt?: FirebaseFirestore.Timestamp;
};

type MessageResponse = {
  id: string;
  room: string;
  content: string;
  sender: StoredMember;
  createdAt: string;
};

const db = getFirestore();
const roomsCollection = db.collection('rooms');
const messagesCollection = db.collection('messages');

const serializeMessage = (
  doc: FirebaseFirestore.DocumentSnapshot<MessageRecord>
): MessageResponse => {
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

export const getRoomMessages = async (
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

    const roomData = snapshot.data() as RoomRecord;
    const { map: memberMap, mutated } = normalizeMemberStore(roomData.members, 'member');

    if (mutated) {
      await roomRef.set({ members: memberMap }, { merge: true });
    }

    if (!memberMap[req.user.id]) {
      res.status(403).json({ message: 'Join the room to view its messages' });
      return;
    }

    const messagesSnapshot = await messagesCollection
      .where('roomId', '==', roomId)
      .orderBy('createdAt', 'asc')
      .limit(500)
      .get();

    const messages = messagesSnapshot.docs.map(serializeMessage);
    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (
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
    const content = (req.body?.content as string | undefined)?.trim();

    if (!content) {
      res.status(400).json({ message: 'Message content is required' });
      return;
    }

    const roomRef = roomsCollection.doc(roomId);
    const snapshot = await roomRef.get();

    if (!snapshot.exists) {
      res.status(404).json({ message: 'Room not found' });
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

    if (!memberMap[req.user.id]) {
      try {
        const freshSnapshot = buildMemberSnapshot(req.user, adminMap[req.user.id] ? 'admin' : 'member');
        await roomRef.set(
          {
            [`members.${req.user.id}`]: freshSnapshot,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
        memberMap[req.user.id] = freshSnapshot;
      } catch (membershipError) {
        res.status(403).json({ message: 'Join the room before sending messages' });
        return;
      }
    }

    const isAdmin = Boolean(adminMap[req.user.id]);
    const messageRef = await messagesCollection.add({
      roomId,
      content,
      sender: buildMemberSnapshot(req.user, isAdmin ? 'admin' : 'member'),
      createdAt: FieldValue.serverTimestamp(),
    });

    const persisted = await messageRef.get();
    res.status(201).json(serializeMessage(persisted));
  } catch (error) {
    next(error);
  }
};
