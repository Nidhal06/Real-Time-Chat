import styled from "styled-components";

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(3, 6, 18, 0.85);
  backdrop-filter: blur(6px);
  z-index: 10000;
`;

export const Modal = styled.div`
  width: min(560px, 92vw);
  background: var(--bg-panel-strong);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 1.5rem;
  padding: clamp(1.5rem, 3vw, 2rem);
  box-shadow: 0 35px 70px rgba(2, 6, 23, 0.65);

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;

    h3 {
      margin: 0;
      font-size: 1.4rem;
    }

    button {
      border: none;
      background: rgba(15, 23, 42, 0.6);
      border-radius: 999px;
      color: var(--text-muted);
      font-size: 1.2rem;
      cursor: pointer;
      width: 36px;
      height: 36px;
      display: grid;
      place-items: center;
    }
  }

  textarea {
    width: 100%;
    border-radius: 1rem;
    border: 1px solid rgba(148, 163, 184, 0.25);
    background: rgba(15, 23, 42, 0.75);
    color: var(--text-primary);
    padding: 0.9rem;
    resize: vertical;
    font-size: 0.95rem;

    &:focus {
      outline: none;
      border-color: rgba(124, 58, 237, 0.6);
      box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.2);
    }
  }

  p {
    margin-top: 0;
    color: var(--text-muted);
  }
`;

export const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem;

  button {
    border: none;
    border-radius: 999px;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(120deg, var(--accent), var(--accent-strong));
    color: #fff;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    cursor: pointer;
    box-shadow: 0 15px 35px rgba(124, 58, 237, 0.35);
  }
`;

export const Alert = styled.div<{ $variant: "success" | "error" }>`
  margin-top: 1rem;
  border-radius: 1rem;
  padding: 0.85rem 1rem;
  background: ${({ $variant }) =>
    $variant === "success"
      ? "rgba(16, 185, 129, 0.18)"
      : "rgba(248, 113, 113, 0.18)"};
  color: ${({ $variant }) =>
    $variant === "success" ? "var(--success)" : "var(--danger)"};
  border: 1px solid
    ${({ $variant }) =>
      $variant === "success"
        ? "rgba(16, 185, 129, 0.35)"
        : "rgba(248, 113, 113, 0.35)"};
`;

export const SkippedList = styled.div`
  margin-top: 1rem;
  color: var(--text-muted);

  ul {
    margin: 0.5rem 0 0;
    padding-left: 1.25rem;
  }
`;
