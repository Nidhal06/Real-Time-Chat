import { FormEvent, useState } from "react";
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

const Register = (): JSX.Element => {
  const { register, loginWithGoogle, loginWithFacebook } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [federatedLoading, setFederatedLoading] = useState<
    "google" | "facebook" | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await register(form);
    } catch (err) {
      const apiMessage = (err as { response?: { data?: { message?: string } } })
        .response?.data?.message;
      const fallback = err instanceof Error ? err.message : undefined;
      setError(apiMessage ?? fallback ?? "Unable to create account");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignUp = async (): Promise<void> => {
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

  const handleFacebookSignUp = async (): Promise<void> => {
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
    navigate("/login", { state: location.state });
  };

  return (
    <AuthLayout
      mode="register"
      eyebrow="Create space"
      title="Join the conversation"
      subtitle="Spin up a profile and unlock live rooms, invites, and shared archives."
      heroTagline="New energy, same room"
      heroSupport="Two characters floating through speech bubbles signal the lively vibe awaiting inside."
      toggleHint="Already have an account?"
      toggleLabel="Sign in"
      inactiveTitle="Returning member?"
      inactiveCopy="Slide back into sign in to pick up threads right where you left them."
      onToggle={handleToggle}
    >
      <AuthForm onSubmit={handleSubmit}>
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <TextInput
          id="name"
          type="text"
          placeholder="Nidhal Gharbi"
          required
          value={form.name}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, name: event.target.value }))
          }
        />

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
          placeholder="At least 6 characters"
          minLength={6}
          required
          value={form.password}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, password: event.target.value }))
          }
        />

        {error ? <ErrorText>{error}</ErrorText> : null}

        <PrimaryButton type="submit" disabled={submitting}>
          {submitting ? "Creating…" : "Create Account"}
        </PrimaryButton>

        <FormDivider>or continue with</FormDivider>

        <ProviderRow>
          <ProviderButton
            type="button"
            onClick={() => void handleGoogleSignUp()}
            disabled={federatedLoading !== null}
            $variant="google"
          >
            {federatedLoading === "google" ? "Connecting…" : "Google"}
          </ProviderButton>
          <ProviderButton
            type="button"
            onClick={() => void handleFacebookSignUp()}
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

export default Register;
