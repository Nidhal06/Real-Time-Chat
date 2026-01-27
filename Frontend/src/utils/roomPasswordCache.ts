const buildPasswordKey = (roomId: string): string => `room-password:${roomId}`;

const getSessionStorage = (): Storage | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};

export const readRoomPassword = (roomId?: string): string | null => {
  if (!roomId) {
    return null;
  }

  const store = getSessionStorage();
  return store?.getItem(buildPasswordKey(roomId)) ?? null;
};

export const writeRoomPassword = (roomId: string, value: string): void => {
  const store = getSessionStorage();
  store?.setItem(buildPasswordKey(roomId), value);
};

export const clearRoomPassword = (roomId: string): void => {
  const store = getSessionStorage();
  store?.removeItem(buildPasswordKey(roomId));
};
