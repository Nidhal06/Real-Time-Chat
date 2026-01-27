import styled from "styled-components";

export type StatTone = "violet" | "amber" | "cyan" | "emerald";

export const Shell = styled.main`
  min-height: 100vh;
  padding: clamp(1.25rem, 5vw, 4rem);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  overflow: hidden;
  isolation: isolate;
`;

export const BackdropGlow = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
      circle at 20% 20%,
      rgba(59, 130, 246, 0.12),
      transparent 45%
    ),
    radial-gradient(circle at 80% 5%, rgba(236, 72, 153, 0.12), transparent 50%),
    radial-gradient(
      circle at 10% 90%,
      rgba(16, 185, 129, 0.12),
      transparent 45%
    );
  filter: blur(45px);
  opacity: 0.9;
  z-index: -1;
`;

export const HeaderBar = styled.section`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 1.5rem;
  background: rgba(5, 8, 22, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 25px 60px rgba(2, 6, 23, 0.6);
  backdrop-filter: blur(18px);
  position: relative;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at 80% 0%,
      rgba(124, 58, 237, 0.25),
      transparent 60%
    );
    opacity: 0.6;
    pointer-events: none;
  }

  & > * {
    position: relative;
  }

  h2 {
    margin: 0.1rem 0 0;
    font-size: clamp(1.5rem, 3vw, 2.2rem);
  }

  small {
    text-transform: uppercase;
    letter-spacing: 0.3em;
    font-size: 0.75rem;
    color: var(--text-muted);
  }
`;

export const HeaderActions = styled.div`
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
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 600;
    background: rgba(239, 68, 68, 0.2);
    color: var(--danger);
    box-shadow: 0 10px 25px rgba(239, 68, 68, 0.2);
    cursor: pointer;
  }
`;

export const Hero = styled.section`
  border-radius: 1.75rem;
  padding: clamp(1.5rem, 4vw, 3rem);
  background: linear-gradient(
    135deg,
    rgba(15, 23, 42, 0.9),
    rgba(4, 7, 20, 0.95)
  );
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 35px 80px rgba(2, 6, 23, 0.6);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: clamp(1rem, 3vw, 2.5rem);
  position: relative;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at 30% 20%,
      rgba(56, 189, 248, 0.18),
      transparent 55%
    );
    opacity: 0.8;
    pointer-events: none;
  }

  & > * {
    position: relative;
  }
`;

export const HeroContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const HeroVisual = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 0.5rem;
`;

export const HeroImage = styled.img`
  width: min(320px, 90%);
  height: auto;
  filter: drop-shadow(0 25px 45px rgba(2, 6, 23, 0.7));
`;

export const HeroLabel = styled.div`
  position: absolute;
  bottom: 10%;
  right: 10%;
  padding: 0.6rem 1rem;
  border-radius: 0.9rem;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.2);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-size: 0.65rem;
  display: inline-flex;
  flex-direction: column;
  gap: 0.2rem;

  strong {
    letter-spacing: 0.05em;
    color: var(--accent-pop);
  }
`;

export const HeroEyebrow = styled.span`
  text-transform: uppercase;
  letter-spacing: 0.4em;
  font-size: 0.7rem;
  color: var(--text-muted);
`;

export const HeroTitle = styled.h1`
  margin: 0;
  font-size: clamp(2.2rem, 5vw, 3.4rem);
  letter-spacing: -0.02em;
`;

export const HeroCopy = styled.p`
  margin: 0;
  max-width: 60ch;
  color: var(--text-muted);
  line-height: 1.6;
`;

export const HeroBadges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

export const HeroBadge = styled.span`
  border-radius: 999px;
  padding: 0.35rem 0.95rem;
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: var(--accent-pop);
  background: rgba(15, 23, 42, 0.65);
`;

export const StatsStrip = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
`;

const STAT_STYLES: Record<
  StatTone,
  { bg: string; border: string; shadow: string }
> = {
  violet: {
    bg: "linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(99, 102, 241, 0.25))",
    border: "rgba(139, 92, 246, 0.35)",
    shadow: "0 20px 35px rgba(139, 92, 246, 0.25)",
  },
  amber: {
    bg: "linear-gradient(135deg, rgba(251, 191, 36, 0.22), rgba(245, 158, 11, 0.25))",
    border: "rgba(251, 191, 36, 0.35)",
    shadow: "0 20px 35px rgba(251, 191, 36, 0.2)",
  },
  cyan: {
    bg: "linear-gradient(135deg, rgba(59, 130, 246, 0.22), rgba(14, 165, 233, 0.25))",
    border: "rgba(56, 189, 248, 0.4)",
    shadow: "0 20px 35px rgba(56, 189, 248, 0.22)",
  },
  emerald: {
    bg: "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.25))",
    border: "rgba(16, 185, 129, 0.35)",
    shadow: "0 20px 35px rgba(16, 185, 129, 0.22)",
  },
};

export const StatCard = styled.article<{ $tone: StatTone }>`
  padding: 1.2rem 1.4rem;
  border-radius: 1.2rem;
  background: ${({ $tone }) => STAT_STYLES[$tone].bg};
  border: 1px solid ${({ $tone }) => STAT_STYLES[$tone].border};
  box-shadow: ${({ $tone }) => STAT_STYLES[$tone].shadow};
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  span {
    text-transform: uppercase;
    letter-spacing: 0.28em;
    font-size: 0.62rem;
    color: var(--text-muted);
  }

  strong {
    font-size: 1.9rem;
    letter-spacing: -0.02em;
  }

  small {
    color: var(--text-muted);
  }
`;

export const Grid = styled.section`
  display: grid;
  grid-template-columns: minmax(300px, 360px) 1fr;
  gap: 1.75rem;

  @media (max-width: 1000px) {
    grid-template-columns: 1fr;
  }
`;

export const Panel = styled.article`
  border-radius: 1.6rem;
  background: var(--bg-panel-strong);
  border: 1px solid rgba(148, 163, 184, 0.16);
  box-shadow: 0 25px 60px rgba(2, 6, 23, 0.55);
  position: relative;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at 90% 10%,
      rgba(56, 189, 248, 0.12),
      transparent 55%
    );
    opacity: 0.7;
    pointer-events: none;
  }

  & > * {
    position: relative;
  }
`;

export const CreateCard = styled(Panel)`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;

  h3 {
    margin: 0;
    font-size: 1.6rem;
  }

  p {
    margin: 0;
    color: var(--text-muted);
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    label {
      text-transform: uppercase;
      letter-spacing: 0.18em;
      font-size: 0.7rem;
      color: var(--text-muted);
    }

    input,
    textarea,
    select {
      border-radius: 1.1rem;
      border: 1px solid rgba(148, 163, 184, 0.25);
      padding: 0.9rem 1.1rem;
      background: rgba(10, 15, 35, 0.8);
      color: var(--text-primary);
      font-size: 1rem;
      font-family: inherit;
      transition: border 150ms ease, box-shadow 150ms ease;

      &:focus {
        outline: none;
        border-color: rgba(124, 58, 237, 0.7);
        box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.2);
      }
    }

    textarea {
      min-height: 120px;
      resize: vertical;
    }

    button {
      border: none;
      border-radius: 1rem;
      padding: 1rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      background: linear-gradient(120deg, var(--accent), var(--accent-strong));
      color: #fff;
      cursor: pointer;
      box-shadow: 0 18px 35px rgba(124, 58, 237, 0.35);
    }
  }
`;

export const TypeSelect = styled.select`
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
`;

export const FormHint = styled.small`
  display: block;
  margin-top: 0.35rem;
  color: var(--text-muted);
  font-size: 0.8rem;
`;

export const RoomList = styled(Panel)`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

export const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  flex-wrap: wrap;

  h3 {
    margin: 0;
    font-size: 1.4rem;
  }

  span {
    color: var(--text-muted);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-size: 0.75rem;
  }
`;

export const ReloadButton = styled.button`
  border: none;
  border-radius: 999px;
  padding: 0.45rem 1.4rem;
  background: rgba(56, 189, 248, 0.15);
  color: var(--accent-pop);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 12px 25px rgba(56, 189, 248, 0.18);

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

export const RoomCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.25rem;
`;

export const RoomCard = styled.article`
  padding: 1.5rem;
  border-radius: 1.4rem;
  background: linear-gradient(
      135deg,
      rgba(15, 23, 42, 0.85),
      rgba(4, 7, 20, 0.9)
    ),
    rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.2);
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  box-shadow: 0 20px 40px rgba(2, 6, 23, 0.5);
  transition: transform 200ms ease, border 200ms ease;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(124, 58, 237, 0.5);
  }
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
`;

export const CardTitle = styled.h4`
  margin: 0;
  font-size: 1.3rem;
`;

export const RoomBadge = styled.span<{ $variant: "public" | "private" }>`
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  border: 1px solid
    ${({ $variant }) =>
      $variant === "private"
        ? "rgba(248, 250, 252, 0.4)"
        : "rgba(16, 185, 129, 0.5)"};
  color: ${({ $variant }) =>
    $variant === "private" ? "var(--accent-strong)" : "var(--success)"};
  background: ${({ $variant }) =>
    $variant === "private"
      ? "rgba(124, 58, 237, 0.12)"
      : "rgba(16, 185, 129, 0.12)"};
`;

export const CardDescription = styled.p`
  margin: 0;
  color: var(--text-muted);
  min-height: 48px;
`;

export const CreatedBy = styled.p`
  margin: 0.3rem 0 0;
  color: var(--text-muted);
  font-size: 0.82rem;
`;

export const MetaRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.35rem;

  strong {
    font-size: 1.6rem;
  }

  span {
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font-size: 0.72rem;
  }
`;

export const AccessTag = styled.span`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.25em;
  color: var(--text-muted);
`;

export const JoinButton = styled.button`
  margin-top: auto;
  border: none;
  border-radius: 0.9rem;
  padding: 0.9rem 1rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 600;
  background: linear-gradient(120deg, var(--accent), var(--accent-strong));
  color: #fff;
  cursor: pointer;
  box-shadow: 0 15px 30px rgba(124, 58, 237, 0.35);
`;

export const Placeholder = styled.p`
  margin: 2rem 0;
  text-align: center;
  color: var(--text-muted);
  letter-spacing: 0.08em;
`;

export const ErrorBanner = styled.p`
  margin: 0;
  padding: 0.9rem 1.1rem;
  border-radius: 0.9rem;
  background: rgba(251, 113, 133, 0.18);
  color: var(--danger);
  border: 1px solid rgba(251, 113, 133, 0.4);
`;
