import { useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout, {
  AuthForm,
  ErrorText,
  FieldLabel,
  FormDivider,
  PrimaryButton,
  ProviderButton,
  ProviderRow,
  TextInput,
} from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";

const Login = (): JSX.Element => {
  const { login, loginWithGoogle, loginWithFacebook } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [federatedLoading, setFederatedLoading] = useState<
    "google" | "facebook" | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(form);
    } catch (err) {
      const apiMessage = (err as { response?: { data?: { message?: string } } })
        .response?.data?.message;
      const fallback = err instanceof Error ? err.message : undefined;
      setError(apiMessage ?? fallback ?? "Unable to sign in");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async (): Promise<void> => {
    setError(null);
    setFederatedLoading("google");

    try {
      await loginWithGoogle();
    } catch (err) {
      const fallback = err instanceof Error ? err.message : undefined;
      setError(fallback ?? "Unable to continue with Google");
    } finally {
      setFederatedLoading(null);
    }
  };

  const handleFacebookSignIn = async (): Promise<void> => {
    setError(null);
    setFederatedLoading("facebook");

    try {
      await loginWithFacebook();
    } catch (err) {
      const fallback = err instanceof Error ? err.message : undefined;
      setError(fallback ?? "Unable to continue with Facebook");
    } finally {
      setFederatedLoading(null);
    }
  };

  const handleToggle = (): void => {
    navigate("/register", { state: location.state });
  };

  return (
    <AuthLayout
      mode="login"
      eyebrow="Welcome back"
      title="Sign in to continue"
      subtitle="Slide back into your live rooms and private chats."
      heroTagline="Live threads, living energy"
      toggleHint="Need an account?"
      toggleLabel="Create account"
      inactiveTitle="New collaborator?"
      inactiveCopy="Craft a secure profile so invites, rooms, and presence follow you everywhere."
      onToggle={handleToggle}
    >
      <AuthForm onSubmit={handleSubmit}>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <TextInput
          id="email"
          type="email"
          placeholder="you@example.com"
          required
          value={form.email}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, email: event.target.value }))
          }
        />

        <FieldLabel htmlFor="password">Password</FieldLabel>
        <TextInput
          id="password"
          type="password"
          placeholder="••••••••"
          required
          value={form.password}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, password: event.target.value }))
          }
        />

        {error ? <ErrorText>{error}</ErrorText> : null}

        <PrimaryButton type="submit" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign In"}
        </PrimaryButton>

        <FormDivider>or continue with</FormDivider>

        <ProviderRow>
          <ProviderButton
            type="button"
            onClick={() => void handleGoogleSignIn()}
            disabled={federatedLoading !== null}
            $variant="google"
          >
            {federatedLoading === "google" ? "Connecting…" : "Google"}
          </ProviderButton>
          <ProviderButton
            type="button"
            onClick={() => void handleFacebookSignIn()}
            disabled={federatedLoading !== null}
            $variant="facebook"
          >
            {federatedLoading === "facebook" ? "Connecting…" : "Facebook"}
          </ProviderButton>
        </ProviderRow>
      </AuthForm>
    </AuthLayout>
  );
};

export default Login;
