// email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export type InvitationEmailPayload = {
  to: string;
  roomName: string;
  invitedBy: string;
  inviteLink: string;
};

export const sendInvitationEmail = async ({
  to,
  roomName,
  invitedBy,
  inviteLink,
}: InvitationEmailPayload): Promise<void> => {

  if (!process.env.RESEND_API_KEY) {
    throw new Error('❌ RESEND_API_KEY is missing');
  }

  const subject = `You're invited to join "${roomName}"`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.6;">
      <h2>You're invited to a chat room!</h2>
      <p><strong>${invitedBy}</strong> invited you to join:</p>
      <p><strong>${roomName}</strong></p>
      <p style="margin:24px 0;">
        <a href="${inviteLink}"
           style="background:#4f46e5;color:#fff;padding:12px 20px;
                  text-decoration:none;border-radius:6px;font-weight:600;">
          Join Room
        </a>
      </p>
      <p>If the button doesn’t work, open this link:</p>
      <p>${inviteLink}</p>
    </div>
  `;

  console.log('📨 Sending invitation via Resend:', to);

  const result = await resend.emails.send({
    from: 'Chat App <onboarding@resend.dev>', // works immediately
    to,
    subject,
    html,
  });

  if (result.error) {
    throw new Error(`❌ Resend failed: ${result.error.message}`);
  }

  console.log('✅ Invitation sent successfully to', to);
};
