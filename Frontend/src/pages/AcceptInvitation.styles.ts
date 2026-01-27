import styled from "styled-components";

export const Shell = styled.main`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1.5rem, 5vw, 3.5rem);
  position: relative;
  overflow: hidden;
`;

export const Backdrop = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
      circle at 20% 25%,
      rgba(124, 58, 237, 0.18),
      transparent 45%
    ),
    radial-gradient(
      circle at 80% 10%,
      rgba(56, 189, 248, 0.18),
      transparent 55%
    );
  filter: blur(30px);
  opacity: 0.9;
`;

export const Card = styled.section`
  width: min(520px, 95vw);
  background: var(--bg-panel-strong);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 1.75rem;
  padding: clamp(2rem, 4vw, 3rem);
  text-align: left;
  box-shadow: 0 40px 80px rgba(2, 6, 23, 0.6);

  h1 {
    margin: 0.5rem 0 1rem;
    font-size: clamp(2rem, 4vw, 2.5rem);
  }

  p {
    color: var(--text-muted);
  }
`;

export const InviteMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1rem;
  color: var(--text-muted);
`;

export const ErrorMessage = styled.p`
  color: var(--danger);
`;

export const InviteBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  border: 1px solid rgba(124, 58, 237, 0.4);
  color: var(--accent-strong);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.65rem;
`;

export const StatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.7rem;
  color: var(--text-muted);
`;

export const StatusDot = styled.span<{ $active: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ $active }) =>
    $active ? "var(--success)" : "rgba(248, 113, 113, 0.6)"};
  box-shadow: ${({ $active }) =>
    $active
      ? "0 0 12px rgba(34, 197, 94, 0.8)"
      : "0 0 10px rgba(248, 113, 113, 0.6)"};
`;

export const MutedNote = styled.p`
  margin-top: 2rem;
  font-size: 0.85rem;
  color: var(--text-muted);
`;
