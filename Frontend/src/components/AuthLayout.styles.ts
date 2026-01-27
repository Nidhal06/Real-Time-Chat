import styled, { keyframes } from "styled-components";

export type AuthMode = "login" | "register";

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const bubble = keyframes`
  0% { opacity: 0.8; transform: translateY(0px); }
  50% { opacity: 1; transform: translateY(-6px); }
  100% { opacity: 0.8; transform: translateY(0px); }
`;

export const AuthContainer = styled.main`
  min-height: 100vh;
  padding: clamp(1rem, 4vw, 1.75rem);
  display: flex;
  align-items: stretch;
  justify-content: center;
  position: relative;
  overflow: hidden;
`;

export const Backdrop = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
      circle at 20% 20%,
      rgba(45, 212, 191, 0.24),
      transparent 45%
    ),
    radial-gradient(circle at 80% 0%, rgba(191, 219, 254, 0.3), transparent 50%),
    radial-gradient(
      circle at 10% 90%,
      rgba(248, 113, 113, 0.2),
      transparent 45%
    );
  filter: blur(50px);
  opacity: 0.9;
`;

export const ContentGrid = styled.section`
  width: min(1060px, 100%);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  position: relative;
  border-radius: clamp(1.5rem, 3vw, 2.5rem);
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(15, 23, 42, 0.82);
  box-shadow: 0 40px 80px rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(30px);
  overflow: hidden;

  @media (min-width: 900px) {
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
    gap: 0;
    max-height: 92vh;
  }
`;

export const HeroColumn = styled.div`
  padding: clamp(1.25rem, 3vw, 2.5rem);
  background: linear-gradient(
    140deg,
    rgba(56, 189, 248, 0.15),
    rgba(167, 139, 250, 0.25)
  );
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  overflow: hidden;

  @media (max-width: 899px) {
    display: none;
  }

  @media (min-width: 900px) {
    padding: clamp(1.5rem, 3.5vw, 2.5rem);
  }
`;

export const HeroImageWrapper = styled.div<{ $mode: AuthMode }>`
  width: 100%;
  aspect-ratio: 4 / 3;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: ${({ $mode }) =>
    $mode === "login" ? "translateX(0)" : "translateX(-24px)"};
  transition: transform 450ms ease;

  @media (min-width: 768px) {
    aspect-ratio: 5 / 4;
  }
`;

export const HeroGlow = styled.div`
  position: absolute;
  width: 70%;
  height: 70%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.4),
    transparent 60%
  );
  filter: blur(20px);
  opacity: 0.8;
`;

export const Avatar = styled.div<{ $tone: "violet" | "teal" }>`
  width: clamp(90px, 12vw, 140px);
  height: clamp(90px, 12vw, 140px);
  border-radius: 50%;
  background: ${({ $tone }) =>
    $tone === "violet"
      ? "linear-gradient(135deg, #a855f7, #6366f1)"
      : "linear-gradient(135deg, #34d399, #22d3ee)"};
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  animation: ${float} 5s ease-in-out infinite;
  box-shadow: 0 20px 35px rgba(15, 23, 42, 0.45);

  &:first-of-type {
    left: 12%;
    top: 15%;
  }

  &:last-of-type {
    right: 10%;
    bottom: 12%;
    animation-delay: 1s;
  }

  @media (max-width: 600px) {
    display: none;
  }
`;

export const AvatarFace = styled.div`
  width: 70%;
  height: 70%;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(1.8rem, 3vw, 2.4rem);
`;

export const MessageBubble = styled.span<{ $offset: "left" | "right" }>`
  position: absolute;
  padding: 0.65rem 1rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.95);
  color: #0f172a;
  font-weight: 600;
  box-shadow: 0 15px 35px rgba(15, 23, 42, 0.25);
  animation: ${bubble} 4s ease-in-out infinite;
  ${({ $offset }) =>
    $offset === "left" ? "left: 5%; top: 55%;" : "right: 8%; top: 20%;"}

  @media (max-width: 600px) {
    display: none;
  }
`;

export const HeroCopyBlock = styled.div`
  small {
    text-transform: uppercase;
    letter-spacing: 0.35em;
    font-size: 0.65rem;
    color: rgba(15, 23, 42, 0.75);
  }

  h3 {
    margin: 0.55rem 0 0.35rem;
    font-size: clamp(1.35rem, 2.5vw, 1.85rem);
    color: #0f172a;
  }

  p {
    margin: 0.45rem 0 0;
    font-size: 0.95rem;
    color: rgba(15, 23, 42, 0.9);
  }
`;

export const HeroSupport = styled.p`
  margin-top: 0.55rem;
  font-size: 0.9rem;
  color: rgba(15, 23, 42, 0.7);
`;

export const HeroToggle = styled.div`
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 0.9rem;
  border-top: 1px solid rgba(15, 23, 42, 0.1);
  color: rgba(15, 23, 42, 0.7);

  @media (max-width: 520px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const HeroToggleButton = styled.button`
  border: none;
  border-radius: 999px;
  padding: 0.55rem 1.6rem;
  background: linear-gradient(120deg, #34d399, #a855f7);
  color: #0f172a;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 12px 25px rgba(52, 211, 153, 0.3);
`;

export const MobileToggle = styled.div`
  display: none;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1.2rem;
  border-top: 1px solid rgba(226, 232, 240, 0.12);
  color: rgba(226, 232, 240, 0.75);

  span {
    font-size: 0.95rem;
  }

  @media (max-width: 899px) {
    display: flex;
  }

  @media (max-width: 520px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const CardColumn = styled.div`
  padding: clamp(1.75rem, 4vw, 2.75rem);
  background: rgba(2, 6, 23, 0.65);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  justify-content: center;
  order: -1;

  @media (min-width: 900px) {
    order: 0;
    padding: clamp(1.5rem, 3.5vw, 2.5rem);
  }
`;

export const CardHeader = styled.header`
  text-align: left;
  margin-bottom: 1.5rem;

  span {
    text-transform: uppercase;
    letter-spacing: 0.35em;
    font-size: 0.65rem;
    color: rgba(226, 232, 240, 0.85);
  }

  h1 {
    margin: 0.2rem 0 0.4rem;
    font-size: clamp(1.8rem, 3vw, 2.2rem);
  }

  p {
    margin: 0;
    color: rgba(226, 232, 240, 0.85);
  }
`;

export const AuthForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
`;

export const FieldLabel = styled.label`
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.7rem;
  color: rgba(226, 232, 240, 0.85);
`;

export const TextInput = styled.input`
  width: 100%;
  border-radius: 1rem;
  border: 1px solid rgba(226, 232, 240, 0.25);
  padding: 0.8rem 0.95rem;
  background: rgba(15, 23, 42, 0.65);
  color: #ffffff;
  font-size: 1rem;
  transition: border 200ms ease, box-shadow 200ms ease;

  &:focus {
    outline: none;
    border-color: rgba(110, 231, 183, 0.8);
    box-shadow: 0 0 0 3px rgba(110, 231, 183, 0.2);
  }
`;

export const PrimaryButton = styled.button`
  border: none;
  border-radius: 1rem;
  padding: 0.85rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  background: linear-gradient(120deg, #22d3ee, #a855f7);
  color: #ffffff;
  cursor: pointer;
  transition: transform 150ms ease, opacity 150ms ease;
  box-shadow: 0 20px 40px rgba(168, 85, 247, 0.35);

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
  }

  &:not(:disabled):hover {
    transform: translateY(-2px);
  }
`;

export const FormDivider = styled.div`
  margin: 0.3rem 0 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(226, 232, 240, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.35em;
  font-size: 0.65rem;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: rgba(226, 232, 240, 0.2);
  }
`;

export const ProviderRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.65rem;

  @media (min-width: 520px) {
    flex-direction: row;
  }
`;

export const ProviderButton = styled.button<{ $variant: "google" | "facebook" }>`
  flex: 1;
  border: none;
  border-radius: 1rem;
  padding: 0.75rem 0.9rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  color: #0f172a;
  background: ${({ $variant }) =>
    $variant === "google"
      ? "linear-gradient(120deg, #fcd34d, #f59e0b)"
      : "linear-gradient(120deg, #60a5fa, #c084fc)"};
  box-shadow: 0 12px 25px rgba(15, 23, 42, 0.25);

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

export const ErrorText = styled.span`
  color: #fecdd3;
  font-size: 0.9rem;
`;
