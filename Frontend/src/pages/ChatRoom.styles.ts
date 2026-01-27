import styled from "styled-components";

export type StatTone = "emerald" | "violet" | "amber";

export const Shell = styled.main`
  min-height: 100vh;
  padding: clamp(1rem, 3vw, 2.5rem);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  background: radial-gradient(
      circle at 15% 20%,
      rgba(59, 130, 246, 0.15),
      transparent 45%
    ),
    radial-gradient(circle at 80% 0%, rgba(124, 58, 237, 0.18), transparent 40%),
    var(--bg-primary);
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(
      circle at 70% 80%,
      rgba(16, 185, 129, 0.08),
      transparent 45%
    );
    filter: blur(30px);
  }

  & > * {
    position: relative;
  }
`;

export const TopBar = styled.header`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1.5rem;
  border-radius: 1.5rem;
  background: rgba(4, 6, 19, 0.78);
  border: 1px solid rgba(148, 163, 184, 0.15);
  box-shadow: 0 25px 45px rgba(2, 6, 23, 0.45);
  backdrop-filter: blur(18px);

  h1 {
    margin: 0.25rem 0 0;
    font-size: clamp(1.5rem, 3vw, 2.4rem);
    letter-spacing: -0.01em;
  }

  p {
    margin: 0.3rem 0 0;
    color: var(--text-muted);
  }
`;

export const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

export const BackButton = styled.button`
  border: none;
  border-radius: 999px;
  padding: 0.4rem 1rem;
  background: rgba(148, 163, 184, 0.15);
  color: var(--text-primary);
  cursor: pointer;
`;

export const RoomBadge = styled.span<{ $variant: "public" | "private" }>`
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  border: 1px solid
    ${({ $variant }) =>
      $variant === "private"
        ? "rgba(248, 250, 252, 0.4)"
        : "rgba(16, 185, 129, 0.4)"};
  color: ${({ $variant }) =>
    $variant === "private" ? "var(--accent-strong)" : "var(--success)"};
  background: ${({ $variant }) =>
    $variant === "private"
      ? "rgba(124, 58, 237, 0.15)"
      : "rgba(16, 185, 129, 0.15)"};
`;

export const UserActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;

  span {
    color: var(--text-muted);
  }

  button {
    border: none;
    border-radius: 999px;
    padding: 0.6rem 1.5rem;
    background: rgba(239, 68, 68, 0.15);
    color: var(--danger);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 600;
    cursor: pointer;
  }
`;

export const Banner = styled.div`
  padding: 0.95rem 1.3rem;
  border-radius: 1rem;
  background: linear-gradient(
    120deg,
    rgba(124, 58, 237, 0.18),
    rgba(59, 130, 246, 0.18)
  );
  color: var(--accent-strong);
  text-align: center;
  letter-spacing: 0.05em;
  border: 1px solid rgba(124, 58, 237, 0.2);
`;

export const Layout = styled.section`
  display: grid;
  grid-template-columns: minmax(240px, 300px) 1fr;
  gap: 1.5rem;
  position: relative;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const Sidebar = styled.aside`
  border-radius: 1.5rem;
  background: linear-gradient(
    180deg,
    rgba(7, 11, 29, 0.88),
    rgba(4, 7, 20, 0.92)
  );
  border: 1px solid rgba(148, 163, 184, 0.1);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 20px 35px rgba(2, 6, 23, 0.4);
`;

export const ChatPanel = styled.section`
  min-height: 70vh;
  border-radius: 1.5rem;
  background: linear-gradient(
    160deg,
    rgba(8, 11, 28, 0.9),
    rgba(5, 7, 22, 0.95)
  );
  border: 1px solid rgba(148, 163, 184, 0.12);
  padding: 1rem;
  box-shadow: 0 25px 40px rgba(2, 6, 23, 0.55);
`;

export const InviteButton = styled.button`
  border: none;
  border-radius: 999px;
  padding: 0.45rem 1.4rem;
  margin-top: 0.75rem;
  background: linear-gradient(120deg, #7c3aed, #a855f7);
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 12px 25px rgba(124, 58, 237, 0.35);
`;

export const UserSearch = styled.div`
  width: 100%;
`;

export const UserSearchInput = styled.input`
  width: 100%;
  padding: 0.65rem 1rem;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(15, 23, 42, 0.8);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: border 200ms ease, box-shadow 200ms ease;

  &::placeholder {
    color: var(--text-muted);
    letter-spacing: 0.05em;
  }

  &:focus {
    outline: none;
    border-color: rgba(124, 58, 237, 0.6);
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.2);
  }
`;

export const SectionTitle = styled.h4`
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 0.75rem;
  color: var(--text-muted);
`;

export const NameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const RoleTag = styled.span<{ $variant: "admin" | "member" }>`
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  padding: 0.1rem 0.4rem;
  border-radius: 999px;
  background: ${({ $variant }) =>
    $variant === "admin"
      ? "rgba(124, 58, 237, 0.25)"
      : "rgba(148, 163, 184, 0.2)"};
  color: ${({ $variant }) =>
    $variant === "admin" ? "var(--accent-strong)" : "var(--text-muted)"};
`;

export const UserList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  min-height: 120px;

  p {
    margin: 0;
    color: var(--text-muted);
    letter-spacing: 0.03em;
  }
`;

export const UserPill = styled.div<{ $online?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.75rem;
  border-radius: 1rem;
  background: ${({ $online }) =>
    $online
      ? "linear-gradient(120deg, rgba(16, 185, 129, 0.18), rgba(5, 150, 105, 0.2))"
      : "rgba(15, 23, 42, 0.65)"};
  border: 1px solid rgba(148, 163, 184, 0.12);
  box-shadow: ${({ $online }) =>
    $online ? "0 12px 25px rgba(16, 185, 129, 0.15)" : "none"};

  strong {
    display: block;
  }

  small {
    color: var(--text-muted);
  }
`;

export const StatusDot = styled.span<{ $online?: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ $online }) =>
    $online ? "var(--success)" : "rgba(148, 163, 184, 0.35)"};
  display: inline-flex;
  box-shadow: ${({ $online }) =>
    $online ? "0 0 10px rgba(16, 185, 129, 0.85)" : "none"};
`;

const STAT_TONES: Record<
  StatTone,
  { bg: string; border: string; shadow: string }
> = {
  emerald: {
    bg: "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.25))",
    border: "rgba(16, 185, 129, 0.35)",
    shadow: "0 15px 30px rgba(16, 185, 129, 0.18)",
  },
  violet: {
    bg: "linear-gradient(135deg, rgba(124, 58, 237, 0.18), rgba(99, 102, 241, 0.25))",
    border: "rgba(124, 58, 237, 0.35)",
    shadow: "0 15px 30px rgba(124, 58, 237, 0.18)",
  },
  amber: {
    bg: "linear-gradient(135deg, rgba(251, 191, 36, 0.18), rgba(245, 158, 11, 0.25))",
    border: "rgba(251, 191, 36, 0.35)",
    shadow: "0 15px 30px rgba(251, 191, 36, 0.2)",
  },
};

export const StatsRow = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
`;

export const StatCard = styled.article<{ $tone: StatTone }>`
  padding: 1.2rem 1.4rem;
  border-radius: 1.2rem;
  background: ${({ $tone }) => STAT_TONES[$tone].bg};
  border: 1px solid ${({ $tone }) => STAT_TONES[$tone].border};
  box-shadow: ${({ $tone }) => STAT_TONES[$tone].shadow};
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  span {
    text-transform: uppercase;
    letter-spacing: 0.25em;
    font-size: 0.62rem;
    color: var(--text-muted);
  }

  strong {
    font-size: 1.8rem;
    letter-spacing: -0.02em;
  }

  small {
    color: var(--text-muted);
  }
`;
