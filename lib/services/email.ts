import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface InvitationEmailProps {
  to: string;
  organizationName: string;
  inviteToken: string;
  invitedBy: string;
}

export async function sendInvitationEmail({
  to,
  organizationName,
  inviteToken,
  invitedBy,
}: InvitationEmailProps) {
  if (!resend) {
    console.warn("Resend not configured. Email would have been sent to:", to);
    return { success: true, mock: true };
  }

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${inviteToken}`;

  try {
    const result = await resend.emails.send({
      from: "HVACOps <invites@hvacops.com>",
      to,
      subject: `You've been invited to join ${organizationName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0369a1;">You're Invited!</h1>
          <p>Hello,</p>
          <p><strong>${invitedBy}</strong> has invited you to join <strong>${organizationName}</strong> on HVACOps.</p>
          <div style="margin: 32px 0;">
            <a href="${inviteUrl}" 
               style="background: #0369a1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            This link expires in 7 days. If you didn't expect this invitation, you can safely ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
          <p style="color: #999; font-size: 12px;">
            HVACOps - Field Service Management Platform
          </p>
        </div>
      `,
    });

    return { success: true, result };
  } catch (error) {
    console.error("Failed to send invitation email:", error);
    throw error;
  }
}

interface InvoiceEmailProps {
  to: string;
  invoiceNumber: string;
  amount: string;
  customerName: string;
  invoiceUrl: string;
}

export async function sendInvoiceEmail({
  to,
  invoiceNumber,
  amount,
  customerName,
  invoiceUrl,
}: InvoiceEmailProps) {
  if (!resend) {
    console.warn("Resend not configured. Invoice email would have been sent to:", to);
    return { success: true, mock: true };
  }

  try {
    const result = await resend.emails.send({
      from: "HVACOps <invoices@hvacops.com>",
      to,
      subject: `Invoice ${invoiceNumber} - ${amount}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0369a1;">New Invoice</h1>
          <p>Hello ${customerName},</p>
          <p>Thank you for your business. Please find your invoice details below:</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Invoice Number:</strong> ${invoiceNumber}</p>
            <p style="margin: 10px 0 0; font-size: 24px; color: #0369a1;"><strong>${amount}</strong></p>
          </div>
          <div style="margin: 32px 0;">
            <a href="${invoiceUrl}" 
               style="background: #0369a1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View & Pay Invoice
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            If you have any questions, please don't hesitate to contact us.
          </p>
        </div>
      `,
    });

    return { success: true, result };
  } catch (error) {
    console.error("Failed to send invoice email:", error);
    throw error;
  }
}
