import type { PropsWithChildren } from "react";
import {
  AuthContainer,
  Avatar,
  AvatarFace,
  Backdrop,
  CardColumn,
  CardHeader,
  ContentGrid,
  HeroColumn,
  HeroCopyBlock,
  HeroGlow,
  HeroImageWrapper,
  HeroSupport,
  HeroToggle,
  HeroToggleButton,
  MobileToggle,
  MessageBubble,
} from "./AuthLayout.styles";
import type { AuthMode } from "./AuthLayout.styles";

type AuthLayoutProps = {
  mode: AuthMode;
  eyebrow: string;
  title: string;
  subtitle: string;
  heroTagline: string;
  heroSupport: string;
  toggleLabel: string;
  toggleHint: string;
  inactiveTitle: string;
  inactiveCopy: string;
  onToggle: () => void;
};

const AuthLayout = ({
  mode,
  eyebrow,
  title,
  subtitle,
  heroTagline,
  heroSupport,
  toggleLabel,
  toggleHint,
  inactiveTitle,
  inactiveCopy,
  onToggle,
  children,
}: PropsWithChildren<AuthLayoutProps>): JSX.Element => {
  return (
    <AuthContainer>
      <Backdrop aria-hidden="true" />
      <ContentGrid>
        <HeroColumn>
          <HeroImageWrapper $mode={mode}>
            <HeroGlow />
            <Avatar $tone="violet" aria-hidden="true">
              <AvatarFace>
                <span role="img" aria-label="person smiling">
                  <img
                    src="/chat-message.png"
                    alt=""
                    width={100}
                    height={100}
                  />
                </span>
              </AvatarFace>
            </Avatar>
            <Avatar $tone="teal" aria-hidden="true">
              <AvatarFace>
                <span role="img" aria-label="person talking">
                  <img src="/chat-person.png" alt="" width={100} height={100} />
                </span>
              </AvatarFace>
            </Avatar>
            <MessageBubble $offset="left">Let's catch up!</MessageBubble>
            <MessageBubble $offset="right">Already here ✨</MessageBubble>
          </HeroImageWrapper>

          <HeroCopyBlock>
            <small>{heroTagline}</small>
            <h3>{inactiveTitle}</h3>
            <p>{inactiveCopy}</p>
            <HeroSupport>{heroSupport}</HeroSupport>
          </HeroCopyBlock>

          <HeroToggle>
            <span>{toggleHint}</span>
            <HeroToggleButton type="button" onClick={onToggle}>
              {toggleLabel}
            </HeroToggleButton>
          </HeroToggle>
        </HeroColumn>

        <CardColumn>
          <CardHeader>
            <span>{eyebrow}</span>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </CardHeader>
          {children}
          <MobileToggle>
            <span>{toggleHint}</span>
            <HeroToggleButton type="button" onClick={onToggle}>
              {toggleLabel}
            </HeroToggleButton>
          </MobileToggle>
        </CardColumn>
      </ContentGrid>
    </AuthContainer>
  );
};

export type { AuthMode } from "./AuthLayout.styles";
export {
  AuthForm,
  FieldLabel,
  TextInput,
  PrimaryButton,
  FormDivider,
  ProviderRow,
  ProviderButton,
  ErrorText,
} from "./AuthLayout.styles";

export default AuthLayout;
