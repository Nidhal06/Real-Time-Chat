import styled from "styled-components";

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(3, 6, 18, 0.85);
  backdrop-filter: blur(6px);
  z-index: 1000;
`;

export const Modal = styled.div`
  width: min(480px, 92vw);
  background: var(--bg-panel-strong);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 1.25rem;
  padding: clamp(1rem, 2.5vw, 1.5rem);
  box-shadow: 0 30px 60px rgba(2, 6, 23, 0.6);

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.6rem;

    h3 {
      margin: 0;
      font-size: 1.15rem;
    }

    button {
      border: none;
      background: rgba(15, 23, 42, 0.6);
      border-radius: 999px;
      color: var(--text-muted);
      font-size: 1.15rem;
      cursor: pointer;
      width: 34px;
      height: 34px;
      display: grid;
      place-items: center;
    }
  }

  p {
    margin: 0.25rem 0 0.9rem;
    color: var(--text-muted);
    font-size: 0.95rem;
  }
`;

export const Input = styled.input`
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(15, 23, 42, 0.75);
  color: var(--text-primary);
  padding: 0.85rem;
  font-size: 0.95rem;

  &:focus {
    outline: none;
    border-color: rgba(74, 222, 128, 0.5);
    box-shadow: 0 0 0 4px rgba(74, 222, 128, 0.12);
  }
`;

export const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 0.75rem;

  button {
    border: none;
    border-radius: 999px;
    padding: 0.6rem 1rem;
    cursor: pointer;
  }

  button[type="submit"] {
    background: linear-gradient(120deg, var(--accent), var(--accent-strong));
    color: #fff;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    box-shadow: 0 10px 25px rgba(124, 58, 237, 0.25);
  }

  button[type="button"] {
    background: rgba(100, 116, 139, 0.08);
    color: var(--text-muted);
  }
`;

export const Notice = styled.div<{ $variant?: "error" | "info" }>`
  margin-top: 0.9rem;
  border-radius: 0.75rem;
  padding: 0.65rem 0.9rem;
  background: ${({ $variant }) =>
    $variant === "error" ? "rgba(248,113,113,0.12)" : "rgba(148,163,184,0.06)"};
  color: ${({ $variant }) => ($variant === "error" ? "var(--danger)" : "var(--text-muted)")};
  border: 1px solid rgba(148, 163, 184, 0.07);
`;
