import { FieldValue } from 'firebase-admin/firestore';
import { StoredMember, timestampToIsoString } from '../utils/firestore';

export type InvitationStatus = 'pending' | 'accepted';

export type InvitationRecord = {
  roomId: string;
  roomName: string;
  email: string;
  token: string;
  status: InvitationStatus;
  pendingLookupKey?: string | null;
  createdBy: StoredMember;
  createdAt?: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue;
  acceptedAt?: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue;
  acceptedBy?: StoredMember;
};

export type InvitationResponse = {
  id: string;
  roomId: string;
  roomName: string;
  email: string;
  status: InvitationStatus;
  createdBy: StoredMember;
  createdAt: string;
  acceptedAt: string | null;
};

export const serializeInvitation = (
  doc: FirebaseFirestore.DocumentSnapshot<InvitationRecord>
): InvitationResponse => {
  const data = doc.data();

  if (!data) {
    throw new Error('Invitation data missing');
  }

  return {
    id: doc.id,
    roomId: data.roomId,
    roomName: data.roomName,
    email: data.email,
    status: data.status,
    createdBy: data.createdBy,
    createdAt: timestampToIsoString(data.createdAt ?? null),
    acceptedAt:
      data.status === 'accepted' && data.acceptedAt
        ? timestampToIsoString(data.acceptedAt)
        : null,
  };
};
