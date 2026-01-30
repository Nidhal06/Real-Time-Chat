import { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { FormEvent } from "react";
import {
  Overlay,
  Modal,
  Footer,
  Alert,
  SkippedList,
} from "./SendInvitationModal.styles";

export type SendInvitationResult = {
  invitations: { id: string; email: string; status: string }[];
  skipped: { email: string; reason: string }[];
};

export type SendInvitationModalProps = {
  roomName: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (emails: string[]) => Promise<SendInvitationResult>;
};

const SendInvitationModal = ({
  roomName,
  open,
  onClose,
  onSubmit,
}: SendInvitationModalProps): JSX.Element | null => {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [skipped, setSkipped] = useState<SendInvitationResult["skipped"]>([]);

  // lock document body scroll while modal is open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  const emails = useMemo(() => {
    return value
      .split(/[,\n]/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }, [value]);

  if (!open) {
    return null;
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    if (emails.length === 0) {
      setError("Add at least one email address");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);
    setSkipped([]);

    try {
      const result = await onSubmit(emails);
      setSuccess(
        `Sent ${result.invitations.length} invitation${
          result.invitations.length === 1 ? "" : "s"
        } for ${roomName}.`,
      );
      setValue("");
      setSkipped(result.skipped);
    } catch (submitError) {
      const message =
        (submitError as { response?: { data?: { message?: string } } }).response
          ?.data?.message ??
        (submitError as Error).message ??
        "Failed to send invitations";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const markup = (
    <Overlay>
      <Modal role="dialog" aria-modal="true" aria-labelledby="invite-title">
        <header>
          <h3 id="invite-title">Invite teammates to {roomName}</h3>
          <button type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <p>
          Enter one or more email addresses separated by commas or line breaks.
        </p>
        <form onSubmit={handleSubmit}>
          <textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="name@example.com, teammate@company.com"
            rows={5}
            disabled={submitting}
          />
          <Footer>
            <span>
              {emails.length
                ? `${emails.length} address${emails.length === 1 ? "" : "es"}`
                : ""}
            </span>
            <button type="submit" disabled={submitting}>
              {submitting ? "Sending…" : "Send invitations"}
            </button>
          </Footer>
        </form>
        {error ? <Alert $variant="error">{error}</Alert> : null}
        {success ? <Alert $variant="success">{success}</Alert> : null}
        {skipped.length ? (
          <SkippedList>
            <strong>Skipped:</strong>
            <ul>
              {skipped.map((entry) => (
                <li key={`${entry.email}-${entry.reason}`}>
                  {entry.email}: {entry.reason}
                </li>
              ))}
            </ul>
          </SkippedList>
        ) : null}
      </Modal>
    </Overlay>
  );

  return createPortal(markup, document.body);
};

export default SendInvitationModal;
