import styled from "styled-components";

export type MemberRole = "admin" | "member";

export const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(6, 9, 25, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 25px 55px rgba(2, 6, 23, 0.6);
  backdrop-filter: blur(12px);
`;

export const Messages = styled.div`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: linear-gradient(
      180deg,
      rgba(15, 23, 42, 0.65),
      rgba(3, 7, 18, 0.85)
    ),
    rgba(15, 23, 42, 0.8);
  position: relative;
`;

export const MessageBubble = styled.article<{ $isOwn: boolean }>`
  align-self: ${({ $isOwn }) => ($isOwn ? "flex-end" : "flex-start")};
  background: ${({ $isOwn }) =>
    $isOwn
      ? "linear-gradient(135deg, rgba(124, 58, 237, 0.95), rgba(99, 102, 241, 0.85))"
      : "linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.85))"};
  color: var(--text-primary);
  padding: 1rem 1.15rem;
  border-radius: 1.15rem;
  border-bottom-right-radius: ${({ $isOwn }) =>
    $isOwn ? "0.35rem" : "1.15rem"};
  border-bottom-left-radius: ${({ $isOwn }) =>
    $isOwn ? "1.15rem" : "0.35rem"};
  max-width: min(70ch, 80%);
  box-shadow: ${({ $isOwn }) =>
    $isOwn
      ? "0 15px 35px rgba(124, 58, 237, 0.35)"
      : "0 15px 35px rgba(15, 23, 42, 0.45)"};
  border: 1px solid
    ${({ $isOwn }) =>
      $isOwn ? "rgba(198, 134, 255, 0.45)" : "rgba(148, 163, 184, 0.25)"};

  p {
    margin: 0.35rem 0 0;
    line-height: 1.5;
  }
`;

export const BubbleHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  text-transform: uppercase;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  opacity: 0.85;

  time {
    font-variant-numeric: tabular-nums;
  }
`;

export const IdentityRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

export const RoleChip = styled.span<{ $variant: MemberRole }>`
  font-size: 0.6rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 0.1rem 0.4rem;
  border-radius: 999px;
  background: ${({ $variant }) =>
    $variant === "admin"
      ? "rgba(124, 58, 237, 0.35)"
      : "rgba(148, 163, 184, 0.2)"};
  color: ${({ $variant }) =>
    $variant === "admin" ? "var(--accent-strong)" : "var(--text-muted)"};
`;

export const MessageForm = styled.form`
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background: rgba(3, 6, 18, 0.92);
  border-top: 1px solid rgba(148, 163, 184, 0.12);
  backdrop-filter: blur(10px);
`;

export const MessageInput = styled.textarea`
  flex: 1;
  resize: none;
  border-radius: 0.95rem;
  padding: 1rem 1.1rem;
  background: rgba(15, 23, 42, 0.78);
  color: var(--text-primary);
  font-size: 1rem;
  min-height: 60px;
  max-height: 120px;
  font-family: inherit;
  border: 1px solid rgba(148, 163, 184, 0.25);
  transition: border 150ms ease, box-shadow 150ms ease;

  &:focus {
    outline: none;
    border-color: rgba(124, 58, 237, 0.7);
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.2);
  }
`;

export const SendButton = styled.button`
  border: none;
  border-radius: 0.95rem;
  padding: 0 1.6rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  background: linear-gradient(120deg, var(--accent), var(--accent-strong));
  color: #fff;
  cursor: pointer;
  transition: transform 150ms ease, opacity 150ms ease;
  box-shadow: 0 18px 35px rgba(124, 58, 237, 0.35);

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }

  &:not(:disabled):hover {
    transform: translateY(-2px);
  }
`;
