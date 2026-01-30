import styled, { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`

  :root {
    --bg-primary: #030617;
    --bg-secondary: #070b1f;
    --bg-panel: rgba(9, 13, 31, 0.86);
    --bg-panel-strong: rgba(6, 9, 25, 0.92);
    --text-primary: #f8fafc;
    --text-muted: #8da0c1;
    --accent: #7c3aed;
    --accent-strong: #c084fc;
    --accent-pop: #38bdf8;
    --accent-sun: #fbbf24;
    --success: #22c55e;
    --danger: #fb7185;
    --glow: rgba(124, 58, 237, 0.35);
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: 'General Sans', 'Space Grotesk', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    background-color: var(--bg-primary);
    background-image: radial-gradient(circle at 10% 20%, rgba(62, 131, 255, 0.25), transparent 40%),
      radial-gradient(circle at 80% 0%, rgba(178, 102, 255, 0.18), transparent 45%),
      radial-gradient(circle at 50% 80%, rgba(16, 185, 129, 0.18), transparent 50%);
    color: var(--text-primary);
    min-height: 100vh;
    position: relative;
    overflow-x: hidden;
  }

  body::before {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(120deg, rgba(60, 152, 255, 0.08), rgba(252, 211, 77, 0.06));
    mix-blend-mode: screen;
    opacity: 0.8;
    z-index: 0;
  }

  body::after {
    content: '';
    position: fixed;
    inset: 0;
    background-image: radial-gradient(rgba(248, 250, 252, 0.06) 1px, transparent 1px);
    background-size: 3px 3px;
    opacity: 0.5;
    pointer-events: none;
    mix-blend-mode: soft-light;
    z-index: 0;
  }

  #root {
    min-height: 100vh;
    position: relative;
    z-index: 1;
  }

  ::selection {
    background: rgba(56, 189, 248, 0.35);
    color: #f8fafc;
  }

  ::-webkit-scrollbar {
    width: 10px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(148, 163, 184, 0.1);
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, var(--accent), var(--accent-strong));
    border-radius: 999px;
  }

  a {
    color: inherit;
  }
`;

export const LoadingScreen = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    rgba(15, 23, 42, 0.95),
    rgba(5, 8, 22, 0.95)
  );
  font-size: 1.2rem;
  letter-spacing: 0.02em;
`;
