import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PasswordPromptModal from "../components/modals/PasswordPromptModal";
import { useNavigate, useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import ChatBox from "../components/ChatBox";
import type { ChatMessage } from "../components/ChatBox";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import SendInvitationModal from "../components/modals/SendInvitationModal";
import type { SendInvitationResult } from "../components/modals/SendInvitationModal";
import {
  clearRoomPassword,
  readRoomPassword,
  writeRoomPassword,
} from "../utils/roomPasswordCache";
import {
  Shell,
  TopBar,
  TitleRow,
  BackButton,
  RoomBadge,
  UserActions,
  Banner,
  Layout,
  Sidebar,
  ChatPanel,
  InviteButton,
  UserSearch,
  UserSearchInput,
  SectionTitle,
  NameRow,
  RoleTag,
  UserList,
  UserPill,
  StatusDot,
  StatsRow,
  StatCard,
} from "./ChatRoom.styles";
import type { StatTone } from "./ChatRoom.styles";

type RoomVisibility = "public" | "private";

type MemberRole = "admin" | "member";

type RoomMember = {
  id: string;
  name: string;
  email: string;
  role?: MemberRole;
};

type RoomDetails = {
  id: string;
  name: string;
  description?: string;
  members?: RoomMember[];
  type: RoomVisibility;
  requiresPassword: boolean;
  admins?: RoomMember[];
  createdBy?: RoomMember;
};

type RoomUsersPayload = {
  roomId: string;
  users: RoomMember[];
};

type NotificationPayload = {
  roomId?: string;
  message: string;
};

type RoomStat = {
  label: string;
  value: string;
  hint: string;
  tone: StatTone;
};

const ChatRoom = (): JSX.Element => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const socketRef = useRef<Socket | null>(null);
  const socketJoinedRef = useRef(false);
  const passwordCacheRef = useRef<Record<string, string>>({});
  const [room, setRoom] = useState<RoomDetails | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<RoomMember[]>([]);
  const [banner, setBanner] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [memberQuery, setMemberQuery] = useState("");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [passwordPromptOpen, setPasswordPromptOpen] = useState(false);
  const [passwordPromptRoomName, setPasswordPromptRoomName] = useState<
    string | null
  >(null);
  const passwordPromptResolveRef = useRef<((value?: string) => void) | null>(
    null,
  );

  const adminIds = useMemo(() => {
    const ids = new Set<string>();
    room?.admins?.forEach((member) => ids.add(member.id));
    if (room?.createdBy) {
      ids.add(room.createdBy.id);
    }
    return ids;
  }, [room?.admins, room?.createdBy]);

  const isAdmin = useMemo(() => {
    if (!user?.id) {
      return false;
    }
    return adminIds.has(user.id);
  }, [adminIds, user?.id]);

  const canInvite = room?.type === "private" && isAdmin;

  const attemptHttpJoin = useCallback(
    async (password?: string): Promise<RoomDetails> => {
      if (!roomId) {
        throw new Error("Room id missing");
      }

      const { data } = await axiosClient.post<RoomDetails>(
        `/rooms/${roomId}/join`,
        password ? { password } : {},
      );

      return data;
    },
    [roomId],
  );

  useEffect(() => {
    if (!roomId) {
      return;
    }

    let active = true;

    const joinRoomWithPassword = async (
      inputPassword?: string,
    ): Promise<void> => {
      try {
        const data = await attemptHttpJoin(inputPassword);
        if (!active) {
          return;
        }
        setRoom(data);
        setBanner(null);
      } catch (err) {
        if (!active) {
          return;
        }

        const response = (
          err as {
            response?: { status?: number; data?: { message?: string } };
          }
        ).response;
        const message = response?.data?.message;
        const requiresPassword =
          (response?.status === 403 ||
            message?.toLowerCase().includes("password")) ??
          false;

        if (requiresPassword) {
          if (inputPassword) {
            delete passwordCacheRef.current[roomId];
            clearRoomPassword(roomId);
          }

          // prompt via modal
          setPasswordPromptRoomName(room?.name ?? null);
          setPasswordPromptOpen(true);
          const promptValue = await new Promise<string | undefined>(
            (resolve) => {
              passwordPromptResolveRef.current = resolve;
            },
          );

          if (!promptValue?.trim()) {
            setBanner("Room password required to join this conversation.");
            // make sure to clear modal state if still open
            setPasswordPromptOpen(false);
            setPasswordPromptRoomName(null);
            passwordPromptResolveRef.current = null;
            return;
          }

          const trimmedPassword = promptValue.trim();
          passwordCacheRef.current[roomId] = trimmedPassword;
          writeRoomPassword(roomId, trimmedPassword);
          await joinRoomWithPassword(trimmedPassword);
          return;
        }

        setBanner(message ?? "Unable to load room");
      }
    };

    const cachedPassword =
      passwordCacheRef.current[roomId] ?? readRoomPassword(roomId) ?? undefined;

    if (cachedPassword && !passwordCacheRef.current[roomId]) {
      passwordCacheRef.current[roomId] = cachedPassword;
    }
    void joinRoomWithPassword(cachedPassword);

    return () => {
      active = false;
    };
  }, [attemptHttpJoin, roomId]);

  useEffect(() => {
    if (!roomId || !token) {
      return;
    }

    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ??
      import.meta.env.VITE_API_URL ??
      "http://localhost:5000";

    const socketInstance = io(socketUrl, {
      transports: ["websocket"],
      auth: { token },
    });

    socketRef.current = socketInstance;
    socketJoinedRef.current = false;

    socketInstance.on("message_history", (history: ChatMessage[]) => {
      setMessages(history);
    });

    socketInstance.on("new_message", (message: ChatMessage) => {
      setMessages((previous) => [...previous, message]);
    });

    socketInstance.on(
      "room_users",
      ({ roomId: targetRoom, users }: RoomUsersPayload) => {
        if (targetRoom === roomId) {
          setOnlineUsers(users);
        }
      },
    );

    socketInstance.on("notification", (payload: NotificationPayload) => {
      if (payload.message) {
        setBanner(payload.message);
      }
    });

    socketInstance.on("disconnect", () => {
      setOnlineUsers([]);
    });

    return () => {
      if (socketJoinedRef.current) {
        socketInstance.emit("leave_room", { roomId });
      }
      socketJoinedRef.current = false;
      socketInstance.disconnect();
    };
  }, [roomId, token]);

  useEffect(() => {
    if (!roomId || !room || !socketRef.current || socketJoinedRef.current) {
      return;
    }

    socketRef.current.emit("join_room", { roomId });
    socketJoinedRef.current = true;
  }, [roomId, room]);

  useEffect(() => {
    if (!banner) {
      return;
    }

    const timeoutId = window.setTimeout(() => setBanner(null), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [banner]);

  const normalizedQuery = memberQuery.trim().toLowerCase();

  const decoratedOnline = useMemo(() => {
    return onlineUsers.map((member) => ({
      ...member,
      role: member.role ?? (adminIds.has(member.id) ? "admin" : "member"),
    }));
  }, [onlineUsers, adminIds]);

  const offlineUsers = useMemo(() => {
    if (!room?.members) {
      return [] as RoomMember[];
    }

    const onlineIds = new Set(onlineUsers.map((member) => member.id));
    return room.members
      .filter((member) => !onlineIds.has(member.id))
      .map((member) => ({
        ...member,
        role: member.role ?? (adminIds.has(member.id) ? "admin" : "member"),
      }));
  }, [room?.members, onlineUsers, adminIds]);

  const filteredOnlineUsers = useMemo(() => {
    if (!normalizedQuery) {
      return decoratedOnline;
    }

    return decoratedOnline.filter((member) =>
      member.name.toLowerCase().includes(normalizedQuery),
    );
  }, [decoratedOnline, normalizedQuery]);

  const filteredOfflineUsers = useMemo(() => {
    if (!normalizedQuery) {
      return offlineUsers;
    }

    return offlineUsers.filter((member) =>
      member.name.toLowerCase().includes(normalizedQuery),
    );
  }, [offlineUsers, normalizedQuery]);

  const totalMembers = room?.members?.length ?? 0;
  const onlineCount = decoratedOnline.length;

  const roomStats = useMemo<RoomStat[]>(() => {
    if (!room) {
      return [];
    }

    return [
      {
        label: "Online now",
        value: `${onlineCount}`,
        hint: totalMembers ? `${onlineCount}/${totalMembers} active` : "",
        tone: "emerald" as StatTone,
      },
      {
        label: "Members",
        value: totalMembers ? `${totalMembers}` : "—",
        hint: room.type === "private" ? "Invite-only" : "Open access",
        tone: "violet" as StatTone,
      },
      {
        label: "Privacy",
        value: room.type === "private" ? "Private" : "Public",
        hint:
          room.type === "private"
            ? "Password & invitation required"
            : "Anyone can drop in",
        tone: "amber" as StatTone,
      },
    ];
  }, [room, onlineCount, totalMembers]);

  const handleSendMessage = async (content: string): Promise<void> => {
    if (!socketRef.current || !roomId) {
      return;
    }

    setSending(true);
    socketRef.current.emit("send_message", { roomId, content });
    setSending(false);
  };

  const handleSendInvitations = useCallback(
    async (emails: string[]): Promise<SendInvitationResult> => {
      if (!roomId) {
        throw new Error("Room id missing");
      }

      const { data } = await axiosClient.post<SendInvitationResult>(
        `/rooms/${roomId}/invitations`,
        { emails },
      );

      return data;
    },
    [roomId],
  );

  const handleNavigateBack = (): void => {
    navigate("/");
  };

  return (
    <Shell>
      <TopBar>
        <div>
          <BackButton type="button" onClick={handleNavigateBack}>
            ← Rooms
          </BackButton>
          <TitleRow>
            <h1>{room?.name ?? "Chat room"}</h1>
            {room ? (
              <RoomBadge $variant={room.type}>
                {room.type === "private" ? "Private" : "Public"}
              </RoomBadge>
            ) : null}
          </TitleRow>
          {room?.description ? <p>{room.description}</p> : null}
          {canInvite ? (
            <InviteButton
              type="button"
              onClick={() => setInviteModalOpen(true)}
            >
              Send Invitation
            </InviteButton>
          ) : null}
        </div>
        <UserActions>
          <span>{user?.email}</span>
          <button type="button" onClick={logout}>
            Logout
          </button>
        </UserActions>
      </TopBar>

      {roomStats.length ? (
        <StatsRow>
          {roomStats.map((stat) => (
            <StatCard key={stat.label} $tone={stat.tone}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <small>{stat.hint}</small>
            </StatCard>
          ))}
        </StatsRow>
      ) : null}

      {banner ? <Banner>{banner}</Banner> : null}

      <Layout>
        <Sidebar>
          <UserSearch>
            <UserSearchInput
              type="search"
              placeholder="Search by name"
              value={memberQuery}
              onChange={(event) => setMemberQuery(event.target.value)}
            />
          </UserSearch>
          <SectionTitle>Online now</SectionTitle>
          <UserList>
            {filteredOnlineUsers.length === 0 ? (
              <p>
                {normalizedQuery ? "No matches found" : "Nobody online yet"}
              </p>
            ) : null}
            {filteredOnlineUsers.map((member) => (
              <UserPill key={member.id} $online>
                <StatusDot $online />
                <div>
                  <NameRow>
                    <strong>{member.name}</strong>
                    <RoleTag
                      $variant={
                        adminIds.has(member.id) || member.role === "admin"
                          ? "admin"
                          : "member"
                      }
                    >
                      {adminIds.has(member.id) || member.role === "admin"
                        ? "Admin"
                        : "Member"}
                    </RoleTag>
                  </NameRow>
                  <small>{member.email}</small>
                </div>
              </UserPill>
            ))}
          </UserList>
          <SectionTitle>Offline</SectionTitle>
          <UserList>
            {filteredOfflineUsers.length === 0 ? (
              <p>
                {normalizedQuery
                  ? "No offline matches"
                  : "Everyone is online 🎉"}
              </p>
            ) : null}
            {filteredOfflineUsers.map((member) => (
              <UserPill key={member.id}>
                <StatusDot />
                <div>
                  <NameRow>
                    <strong>{member.name}</strong>
                    <RoleTag
                      $variant={
                        adminIds.has(member.id) || member.role === "admin"
                          ? "admin"
                          : "member"
                      }
                    >
                      {adminIds.has(member.id) || member.role === "admin"
                        ? "Admin"
                        : "Member"}
                    </RoleTag>
                  </NameRow>
                  <small>{member.email}</small>
                </div>
              </UserPill>
            ))}
          </UserList>
        </Sidebar>

        <ChatPanel>
          <ChatBox
            messages={messages}
            currentUserId={user?.id}
            onSend={handleSendMessage}
            sending={sending}
            adminIds={adminIds}
          />
        </ChatPanel>
      </Layout>
      {canInvite ? (
        <SendInvitationModal
          roomName={room?.name ?? "Private room"}
          open={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          onSubmit={handleSendInvitations}
        />
      ) : null}

      <PasswordPromptModal
        open={passwordPromptOpen}
        roomName={passwordPromptRoomName ?? undefined}
        onClose={() => {
          setPasswordPromptOpen(false);
          setPasswordPromptRoomName(null);
          passwordPromptResolveRef.current?.(undefined);
          passwordPromptResolveRef.current = null;
        }}
        onSubmit={(password) => {
          setPasswordPromptOpen(false);
          setPasswordPromptRoomName(null);
          passwordPromptResolveRef.current?.(password);
          passwordPromptResolveRef.current = null;
        }}
      />
    </Shell>
  );
};

export default ChatRoom;
