import { Timestamp } from 'firebase-admin/firestore';

export type MemberRole = 'admin' | 'member';

export type StoredMember = {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: MemberRole;
};

export type MemberStore = Record<string, StoredMember> | StoredMember[] | undefined;

export const timestampToIsoString = (
  value?: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue | Timestamp | Date | string | null
): string => {
  if (!value) {
    return new Date().toISOString();
  }

  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
  }

  return new Date().toISOString();
};

export const buildMemberSnapshot = (user: AuthUser, role: MemberRole = 'member'): StoredMember => ({
  id: user.id,
  name: user.name,
  email: user.email,
  avatar: user.avatar ?? null,
  role,
});

const normalizeSingleMember = (
  member: StoredMember | undefined,
  fallbackRole: MemberRole
): StoredMember | null => {
  if (!member || !member.id) {
    return null;
  }

  return {
    ...member,
    role: member.role ?? fallbackRole,
  };
};

export const normalizeMemberStore = (
  store: MemberStore,
  fallbackRole: MemberRole = 'member'
): { map: Record<string, StoredMember>; list: StoredMember[]; mutated: boolean } => {
  if (!store) {
    return { map: {}, list: [], mutated: false };
  }

  const map: Record<string, StoredMember> = {};
  const assignMember = (member: StoredMember | undefined): void => {
    const normalized = normalizeSingleMember(member, fallbackRole);
    if (normalized) {
      map[normalized.id] = normalized;
    }
  };

  if (Array.isArray(store)) {
    store.forEach(assignMember);
    return { map, list: Object.values(map), mutated: true };
  }

  Object.values(store).forEach(assignMember);
  return { map, list: Object.values(map), mutated: false };
};
