import nodemailer from 'nodemailer';

let cachedTransporter: nodemailer.Transporter | null = null;

const resolveTransporter = (): nodemailer.Transporter => {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true';

  if (!host || !port || !user || !pass) {
    throw new Error('SMTP configuration missing. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.');
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  return cachedTransporter;
};

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
  const from = process.env.INVITE_EMAIL_FROM;

  if (!from) {
    throw new Error('INVITE_EMAIL_FROM env var missing');
  }

  const subject = `You're invited to join "${roomName}"`;
  const html = `
    <p>Hello,</p>
    <p><strong>${invitedBy}</strong> invited you to join the private room <strong>${roomName}</strong>.</p>
    <p>This link is unique to <strong>${to}</strong> and will grant you access without entering the room password.</p>
    <p style="margin:24px 0;">
      <a href="${inviteLink}" style="background-color:#4f46e5;color:#ffffff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600;">Accept Invitation</a>
    </p>
    <p>If you were not expecting this email, you can safely ignore it.</p>
  `;

  const text = [
    `${invitedBy} invited you to join the private room "${roomName}".`,
    'This invitation is linked to your email address and will let you skip the password.',
    `Accept here: ${inviteLink}`,
  ].join('\n\n');

  await resolveTransporter().sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
};
