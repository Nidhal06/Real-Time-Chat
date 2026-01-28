import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  Wrapper,
  Messages,
  MessageBubble,
  BubbleHeader,
  IdentityRow,
  RoleChip,
  MessageForm,
  MessageInput,
  SendButton,
} from "./ChatBox.styles";
import type { MemberRole } from "./ChatBox.styles";

export type ChatMessage = {
  id: string;
  room: string;
  content: string;
  sender: {
    id: string;
    name: string;
    email: string;
    role?: MemberRole;
  };
  createdAt: string;
};

type ChatBoxProps = {
  messages: ChatMessage[];
  currentUserId?: string;
  onSend: (content: string) => Promise<void> | void;
  sending?: boolean;
  adminIds?: Set<string>;
};

const ChatBox = ({
  messages,
  currentUserId,
  onSend,
  sending,
  adminIds,
}: ChatBoxProps): JSX.Element => {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    if (!draft.trim()) {
      return;
    }

    await onSend(draft.trim());
    setDraft("");
  };

  return (
    <Wrapper>
      <Messages>
        {messages.map((message) => {
          const isOwn = message.sender.id === currentUserId;
          const senderRole: MemberRole =
            message.sender.role ??
            (adminIds?.has(message.sender.id) ? "admin" : "member");
          return (
            <MessageBubble key={message.id} $isOwn={isOwn}>
              <BubbleHeader>
                <IdentityRow>
                  <strong>{isOwn ? "You" : message.sender.name}</strong>
                  <RoleChip $variant={senderRole}>
                    {senderRole === "admin" ? "Admin" : "Member"}
                  </RoleChip>
                </IdentityRow>
                <time>
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </BubbleHeader>
              <p>{message.content}</p>
            </MessageBubble>
          );
        })}
        <div ref={bottomRef} />
      </Messages>
      <MessageForm onSubmit={handleSubmit}>
        <MessageInput
          placeholder="Type your message..."
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <SendButton type="submit" disabled={sending || !draft.trim()}>
          {sending ? "Sending…" : "Send"}
        </SendButton>
      </MessageForm>
    </Wrapper>
  );
};

export default ChatBox;
