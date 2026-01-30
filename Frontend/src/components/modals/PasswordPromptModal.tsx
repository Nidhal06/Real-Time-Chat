import { useState } from "react";
import type { FormEvent } from "react";
import {
  Overlay,
  Modal,
  Footer,
  Input,
  Notice,
} from "./PasswordPromptModal.styles";

export type PasswordPromptModalProps = {
  open: boolean;
  roomName?: string;
  onClose: () => void;
  onSubmit: (password: string) => void;
};

const PasswordPromptModal = ({
  open,
  roomName,
  onClose,
  onSubmit,
}: PasswordPromptModalProps): JSX.Element | null => {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Room password is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      onSubmit(trimmed);
      setValue("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Overlay>
      <Modal>
        <header>
          <h3>Enter the password for {roomName ?? "this room"}</h3>
          <button type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <p>Provide the room password to continue.</p>
        <form onSubmit={handleSubmit}>
          <Input
            type="password"
            placeholder="Room password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            disabled={submitting}
          />
          <Footer>
            <button type="button" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" disabled={submitting}>
              {submitting ? "Entering…" : "Enter"}
            </button>
          </Footer>
        </form>
        {error ? <Notice $variant="error">{error}</Notice> : null}
      </Modal>
    </Overlay>
  );
};

export default PasswordPromptModal;
