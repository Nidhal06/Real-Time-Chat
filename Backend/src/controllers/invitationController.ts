import { FieldValue } from 'firebase-admin/firestore';
import { randomBytes } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { getFirestore } from '../config/firebase';
import { AuthRequest } from '../middleware/auth';
import { buildMemberSnapshot, normalizeMemberStore } from '../utils/firestore';
import { sendInvitationEmail } from '../utils/email';
import { InvitationRecord, serializeInvitation } from '../models/Invitation';
import { RoomRecord } from './roomController';

const db = getFirestore();
const roomsCollection = db.collection('rooms');
const invitationsCollection = db.collection('invitations');

const MAX_INVITES_PER_REQUEST = 25;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const buildPendingLookupKey = (roomId: string, email: string): string => `${roomId}::${email}`;
const normalizeEmail = (value: string): string => value.trim().toLowerCase();
const clientBaseUrl = (process.env.CLIENT_URL?.split(',')[0] ?? 'http://localhost:5173').replace(/\/$/, '');

const assertAuthenticated = (req: AuthRequest, res: Response): req is AuthRequest & { user: AuthUser } => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return false;
  }
  return true;
};

const buildInviteLink = (token: string): string => `${clientBaseUrl}/invite/accept/${token}`;

export const sendRoomInvitations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!assertAuthenticated(req, res)) {
      return;
    }

    const { roomId } = req.params;
    const payload = req.body as { emails?: string[] | string };
    const emailsInput = Array.isArray(payload.emails)
      ? payload.emails
      : typeof payload.emails === 'string'
      ? payload.emails.split(',')
      : [];

    const normalizedEmails = Array.from(
      new Set(
        emailsInput
          .map((value) => normalizeEmail(value))
          .filter((value) => Boolean(value) && emailRegex.test(value))
      )
    );

    if (normalizedEmails.length === 0) {
      res.status(400).json({ message: 'Provide at least one valid email address' });
      return;
    }

    if (normalizedEmails.length > MAX_INVITES_PER_REQUEST) {
      res.status(400).json({ message: `You can invite up to ${MAX_INVITES_PER_REQUEST} people at once` });
      return;
    }

    const roomRef = roomsCollection.doc(roomId);
    const snapshot = await roomRef.get();

    if (!snapshot.exists) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }

    const roomData = snapshot.data() as RoomRecord;
    const { map: adminMap } = normalizeMemberStore(roomData.admins, 'admin');
    const isAdmin = Boolean(adminMap[req.user.id] || roomData.createdBy?.id === req.user.id);

    if (!isAdmin) {
      res.status(403).json({ message: 'Only room admins can send invitations' });
      return;
    }

    const createdInvites: FirebaseFirestore.DocumentSnapshot[] = [];
    const skipped: { email: string; reason: string }[] = [];

    for (const email of normalizedEmails) {
      let docRef: FirebaseFirestore.DocumentReference | null = null;

      try {
        const pendingKey = buildPendingLookupKey(roomId, email);
        const existingPending = await invitationsCollection
          .where('pendingLookupKey', '==', pendingKey)
          .limit(1)
          .get();

        if (!existingPending.empty) {
          skipped.push({ email, reason: 'Invitation already pending for this email' });
          continue;
        }

        const token = randomBytes(32).toString('hex');
        const createdBySnapshot = buildMemberSnapshot(req.user, 'admin');
        docRef = await invitationsCollection.add({
          roomId,
          roomName: roomData.name,
          email,
          token,
          status: 'pending',
          pendingLookupKey: pendingKey,
          createdBy: createdBySnapshot,
          createdAt: FieldValue.serverTimestamp(),
        });

        const inviteLink = buildInviteLink(token);
        await sendInvitationEmail({
          to: email,
          roomName: roomData.name,
          invitedBy: req.user.name,
          inviteLink,
        });

        const persisted = await docRef.get();
        createdInvites.push(persisted);
      } catch (error) {
        if (docRef) {
          await docRef.delete();
        }
        skipped.push({ email, reason: (error as Error).message ?? 'Failed to send invitation' });
      }
    }

    const serialized = createdInvites.map((snapshot) => serializeInvitation(snapshot));

    res.status(201).json({ invitations: serialized, skipped });
  } catch (error) {
    next(error);
  }
};

const fetchInvitationByToken = async (
  token: string
): Promise<FirebaseFirestore.QueryDocumentSnapshot | null> => {
  const snapshot = await invitationsCollection.where('token', '==', token).limit(1).get();
  return snapshot.empty ? null : snapshot.docs[0];
};

export const getInvitation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.params;

    if (!token) {
      res.status(400).json({ message: 'Invitation token missing' });
      return;
    }

    const document = await fetchInvitationByToken(token);

    if (!document) {
      res.status(404).json({ message: 'Invitation not found' });
      return;
    }

    res.status(200).json({ invitation: serializeInvitation(document) });
  } catch (error) {
    next(error);
  }
};

export const acceptInvitation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!assertAuthenticated(req, res)) {
      return;
    }

    const { token } = req.params;

    if (!token) {
      res.status(400).json({ message: 'Invitation token missing' });
      return;
    }

    const document = await fetchInvitationByToken(token);

    if (!document) {
      res.status(404).json({ message: 'Invitation not found or expired' });
      return;
    }

    const invitation = document.data();

    if (invitation.status === 'accepted') {
      res.status(410).json({ message: 'Invitation already used' });
      return;
    }

    const normalizedUserEmail = normalizeEmail(req.user.email);

    if (normalizedUserEmail !== invitation.email) {
      res.status(403).json({ message: 'Invitation email does not match your account' });
      return;
    }

    const roomRef = roomsCollection.doc(invitation.roomId);
    const roomSnapshot = await roomRef.get();

    if (!roomSnapshot.exists) {
      res.status(410).json({ message: 'Room is no longer available' });
      return;
    }

    const roomData = roomSnapshot.data() as RoomRecord;
    const { map: memberMap } = normalizeMemberStore(roomData.members, 'member');
    const { map: adminMap } = normalizeMemberStore(roomData.admins, 'admin');

    if (!memberMap[req.user.id]) {
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

    await document.ref.set(
      {
        status: 'accepted',
        acceptedAt: FieldValue.serverTimestamp(),
        acceptedBy: buildMemberSnapshot(req.user, adminMap[req.user.id] ? 'admin' : 'member'),
        pendingLookupKey: null,
      },
      { merge: true }
    );

    const updatedDoc = await document.ref.get();

    res.status(200).json({
      invitation: serializeInvitation(updatedDoc),
      roomId: invitation.roomId,
      roomName: invitation.roomName,
    });
  } catch (error) {
    next(error);
  }
};
