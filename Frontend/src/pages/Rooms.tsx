import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PasswordPromptModal from "../components/modals/PasswordPromptModal";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import {
  clearRoomPassword,
  readRoomPassword,
  writeRoomPassword,
} from "../utils/roomPasswordCache";
import {
  Shell,
  BackdropGlow,
  HeaderBar,
  HeaderActions,
  Hero,
  HeroContent,
  HeroEyebrow,
  HeroTitle,
  HeroCopy,
  HeroBadges,
  HeroBadge,
  HeroVisual,
  HeroImage,
  HeroLabel,
  StatsStrip,
  StatCard,
  Grid,
  CreateCard,
  TypeSelect,
  FormHint,
  RoomList,
  ListHeader,
  ReloadButton,
  RoomCards,
  RoomCard,
  CardHeader,
  CardTitle,
  RoomBadge,
  CardDescription,
  CreatedBy,
  MetaRow,
  AccessTag,
  JoinButton,
  Placeholder,
  ErrorBanner,
} from "./Rooms.styles";
import type { StatTone } from "./Rooms.styles";

type RoomVisibility = "public" | "private";

type MemberRole = "admin" | "member";

type RoomMember = {
  id: string;
  name: string;
  email: string;
  role?: MemberRole;
};

type Room = {
  id: string;
  name: string;
  description?: string;
  members?: RoomMember[];
  type: RoomVisibility;
  requiresPassword: boolean;
  createdBy?: {
    id: string;
    name: string;
    email: string;
    role?: MemberRole;
  };
  admins?: RoomMember[];
};

type RoomStat = {
  label: string;
  value: string;
  hint: string;
  tone: StatTone;
};

const initialRoomForm = {
  name: "",
  description: "",
  type: "public" as RoomVisibility,
  password: "",
};

const Rooms = (): JSX.Element => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [roomForm, setRoomForm] = useState(initialRoomForm);
  const [passwordPromptOpen, setPasswordPromptOpen] = useState(false);
  const [passwordPromptRoomName, setPasswordPromptRoomName] = useState<
    string | null
  >(null);
  const passwordPromptResolveRef = useRef<((value?: string) => void) | null>(
    null,
  );

  const roomStats = useMemo<RoomStat[]>(() => {
    const privateCount = rooms.filter(
      (entry) => entry.type === "private",
    ).length;
    const openCount = rooms.length - privateCount;
    const memberCount = rooms.reduce(
      (sum, room) => sum + (room.members?.length ?? 0),
      0,
    );

    return [
      {
        label: "Active rooms",
        value: rooms.length ? `${rooms.length}` : "0",
        hint: rooms.length ? "Curated spaces" : "Start the first room",
        tone: "violet",
      },
      {
        label: "Private lounges",
        value: privateCount ? `${privateCount}` : "0",
        hint: privateCount ? "Invite-only" : "No private rooms yet",
        tone: "amber",
      },
      {
        label: "Open hangouts",
        value: openCount ? `${openCount}` : "0",
        hint: openCount ? "Drop-in ready" : "All rooms are gated",
        tone: "cyan",
      },
      {
        label: "Connected members",
        value: memberCount ? `${memberCount}` : "0",
        hint: memberCount ? "Collaborators synced" : "Invite your team",
        tone: "emerald",
      },
    ];
  }, [rooms]);

  const loadRooms = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosClient.get<Room[]>("/rooms");
      setRooms(data);
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })
        .response?.data?.message;
      setError(message ?? "Unable to load rooms");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRooms();
  }, [loadRooms]);

  const handleCreateRoom = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    if (!roomForm.name.trim()) {
      return;
    }

    if (
      roomForm.type === "private" &&
      (roomForm.password.trim().length < 4 || !roomForm.password.trim())
    ) {
      setError("Private rooms need a password with at least 4 characters");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const payload: Record<string, string> = {
        name: roomForm.name.trim(),
        type: roomForm.type,
      };

      if (roomForm.description.trim()) {
        payload.description = roomForm.description.trim();
      }

      if (roomForm.type === "private") {
        payload.password = roomForm.password.trim();
      }

      const { data } = await axiosClient.post<Room>("/rooms", payload);
      setRooms((previous) => [data, ...previous]);
      setRoomForm(initialRoomForm);
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })
        .response?.data?.message;
      setError(message ?? "Unable to create room");
    } finally {
      setCreating(false);
    }
  };

  const attemptJoin = useCallback(
    async (roomId: string, password?: string): Promise<void> => {
      await axiosClient.post(
        `/rooms/${roomId}/join`,
        password ? { password } : {},
      );
    },
    [],
  );

  const handleJoinRoom = async (room: Room): Promise<void> => {
    setError(null);
    const needsPassword = room.type === "private" && room.requiresPassword;
    let providedPassword: string | undefined =
      readRoomPassword(room.id) ?? undefined;

    const promptForPassword = (
      roomName: string,
    ): Promise<string | undefined> => {
      setError(null);
      setPasswordPromptRoomName(roomName);
      setPasswordPromptOpen(true);
      return new Promise((resolve) => {
        passwordPromptResolveRef.current = resolve;
      });
    };

    const isMember = Boolean(room.members?.some((m) => m.id === user?.id));

    // If the room is private and the current user isn't a known member, prompt for the password.
    // If the user is already a member, don't ask for the password — allow join without it.
    if (needsPassword && !providedPassword && !isMember) {
      providedPassword = await promptForPassword(room.name);
      if (!providedPassword) {
        setError("Room password is required to join private rooms.");
        return;
      }
    }

    try {
      await attemptJoin(room.id, providedPassword);
      if (providedPassword) {
        writeRoomPassword(room.id, providedPassword);
      } else {
        clearRoomPassword(room.id);
      }
      navigate(`/rooms/${room.id}`);
    } catch (err) {
      const response = (
        err as { response?: { status?: number; data?: { message?: string } } }
      ).response;
      const message = response?.data?.message;
      const passwordRequired =
        response?.status === 403 || message?.toLowerCase().includes("password");

      if (passwordRequired) {
        clearRoomPassword(room.id);
        const retryPassword = await promptForPassword(room.name);
        if (!retryPassword) {
          setError("Room password is required to join private rooms.");
          return;
        }

        try {
          await attemptJoin(room.id, retryPassword);
          writeRoomPassword(room.id, retryPassword);
          navigate(`/rooms/${room.id}`);
          return;
        } catch (innerError) {
          const innerMessage = (
            innerError as { response?: { data?: { message?: string } } }
          ).response?.data?.message;
          setError(innerMessage ?? "Unable to join room");
          return;
        }
      }

      setError(message ?? "Unable to join room");
    }
  };

  return (
    <Shell>
      <BackdropGlow aria-hidden="true" />
      <HeaderBar>
        <div>
          <small>Signed in as</small>
          <h2>{user?.name}</h2>
        </div>
        <HeaderActions>
          <span>{user?.email}</span>
          <button type="button" onClick={logout}>
            Logout
          </button>
        </HeaderActions>
      </HeaderBar>

      <Hero>
        <HeroContent>
          <HeroEyebrow>Realtime rooms</HeroEyebrow>
          <HeroTitle>Design lively spaces for every conversation.</HeroTitle>
          <HeroCopy>
            Spin up private lounges, atmospheric war rooms, or casual hangouts
            in seconds. Passwords, invitations, and presence indicators keep
            each space intentional.
          </HeroCopy>
          <HeroBadges>
            <HeroBadge>End-to-end invites</HeroBadge>
            <HeroBadge>Presence aware</HeroBadge>
            <HeroBadge>Custom privacy</HeroBadge>
          </HeroBadges>
        </HeroContent>
        <HeroVisual>
          <HeroImage src="/banner.png" alt="Live chat illustration" />
          <HeroLabel>
            <span>Live chat</span>
            <strong>Always on</strong>
          </HeroLabel>
        </HeroVisual>
      </Hero>

      <StatsStrip>
        {roomStats.map((stat) => (
          <StatCard key={stat.label} $tone={stat.tone}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <small>{stat.hint}</small>
          </StatCard>
        ))}
      </StatsStrip>

      <Grid>
        <CreateCard>
          <h3>Launch a new room</h3>
          <p>Give it a name, a vibe, and let the invites fly.</p>
          <form onSubmit={handleCreateRoom}>
            <label htmlFor="room-name">Room name</label>
            <input
              id="room-name"
              type="text"
              placeholder="Strategy Lab"
              required
              value={roomForm.name}
              onChange={(event) =>
                setRoomForm((prev) => ({ ...prev, name: event.target.value }))
              }
            />
            <label htmlFor="room-type">Visibility</label>
            <TypeSelect
              id="room-type"
              value={roomForm.type}
              onChange={(event) =>
                setRoomForm((prev) => ({
                  ...prev,
                  type: event.target.value as RoomVisibility,
                  password:
                    event.target.value === "public" ? "" : prev.password,
                }))
              }
            >
              <option value="public">Public — no password</option>
              <option value="private">Private — password required</option>
            </TypeSelect>
            <label htmlFor="room-description">Description</label>
            <textarea
              id="room-description"
              placeholder="What happens inside this room?"
              value={roomForm.description}
              onChange={(event) =>
                setRoomForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
            />
            {roomForm.type === "private" ? (
              <div>
                <label htmlFor="room-password">Room password</label>
                <input
                  id="room-password"
                  type="password"
                  placeholder="Minimum 4 characters"
                  value={roomForm.password}
                  onChange={(event) =>
                    setRoomForm((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                  required
                  minLength={4}
                />
                <FormHint>
                  Visitors will see a magical lock screen before entering.
                </FormHint>
              </div>
            ) : (
              <FormHint>Public rooms are instantly discoverable.</FormHint>
            )}
            <button type="submit" disabled={creating}>
              {creating ? "Creating…" : "Create Room"}
            </button>
          </form>
        </CreateCard>

        <RoomList>
          <ListHeader>
            <div>
              <h3>Live rooms</h3>
              <span>{rooms.length} curated spaces</span>
            </div>
            <ReloadButton
              type="button"
              onClick={() => void loadRooms()}
              disabled={loading}
            >
              Refresh
            </ReloadButton>
          </ListHeader>

          {error ? <ErrorBanner>{error}</ErrorBanner> : null}

          {loading ? (
            <Placeholder>Loading inspiring rooms…</Placeholder>
          ) : rooms.length === 0 ? (
            <Placeholder>
              No rooms yet. Shape the very first creative hub.
            </Placeholder>
          ) : (
            <RoomCards>
              {rooms.map((room) => (
                <RoomCard key={room.id}>
                  <CardHeader>
                    <div>
                      <CardTitle>{room.name}</CardTitle>
                      {room.createdBy ? (
                        <CreatedBy>Hosted by {room.createdBy.name}</CreatedBy>
                      ) : null}
                    </div>
                    <RoomBadge $variant={room.type}>
                      {room.type === "private" ? "Private" : "Public"}
                    </RoomBadge>
                  </CardHeader>
                  {room.description ? (
                    <CardDescription>{room.description}</CardDescription>
                  ) : (
                    <CardDescription>
                      A quiet room awaiting its first sparks.
                    </CardDescription>
                  )}
                  <MetaRow>
                    <strong>{room.members?.length ?? 0}</strong>
                    <span>members</span>
                  </MetaRow>
                  <AccessTag>
                    {room.requiresPassword
                      ? "Password protected"
                      : "Open access"}
                  </AccessTag>
                  <JoinButton
                    type="button"
                    onClick={() => void handleJoinRoom(room)}
                  >
                    {room.type === "private"
                      ? room.members?.some((m) => m.id === user?.id)
                        ? "Enter room"
                        : "Unlock room"
                      : "Join room"}
                  </JoinButton>
                </RoomCard>
              ))}
            </RoomCards>
          )}
        </RoomList>
      </Grid>
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

export default Rooms;
