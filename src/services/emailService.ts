import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // e.g. your Gmail address
    pass: process.env.SMTP_PASS, // app password or SMTP password
  },
});

/**
 * Sends an email verification link to the user.
 * @param {string} email - User's email address
 * @param {string} token - JWT verification token
 */
export const EmailService = {
  async sendVerificationEmail(email: string, token: string) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("SMTP credentials are not set. Skipping email sending.");
      return;
    }

    const verifyUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/verify-email?token=${token}`;

    const mailOptions = {
      from: `"Concept Talk" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Verify your email address - Concept Talk",
      html: generateVerificationEmailTemplate(verifyUrl),
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Verification email sent to ${email}`);
    } catch (err) {
      console.error("Error sending verification email:", err);
      throw { status: 500, message: "Failed to send verification email" };
    }
  },

  /**
   * Sends a notification email (digest or single alert)
   */
  async sendNotificationEmail(
    email: string,
    notifications: {
      title: string;
      body?: string | null;
      link?: string | null;
      createdAt?: string;
    }[]
  ) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("⚠️ SMTP credentials are not set. Skipping notification email.");
      return;
    }

    if (!notifications.length) {
      return;
    }

    const subject =
      notifications.length === 1
        ? "You have a new notification - Concept Talk"
        : `You have ${notifications.length} new notifications - Concept Talk`;

    const mailOptions = {
      from: `"Concept Talk" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      html: generateNotificationEmailTemplate(notifications),
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Notification email sent to ${email} (${notifications.length} item(s))`);
    } catch (err) {
      console.error("Error sending notification email:", err);
      throw { status: 500, message: "Failed to send notification email" };
    }
  },
};
function generateNotificationEmailTemplate(
  notifications: {
    title: string;
    body?: string | null;
    link?: string | null;
    createdAt?: string;
  }[]
) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  const itemsHtml = notifications
    .map(
      (n) => `
        <tr>
          <td style="padding:12px 0;">
            <strong style="font-size:15px; color:#333;">
              ${n.title}
            </strong>
            ${
              n.body
                ? `<p style="margin:6px 0 0; font-size:14px; color:#555;">
                     ${n.body}
                   </p>`
                : ""
            }
          </td>
        </tr>
      `
    )
    .join("");

  return `
  <div style="font-family: Arial, sans-serif; color: #333; max-width:600px; margin:auto;">
    <h2 style="color:#ffe371;">New Notifications</h2>

    <p>You have new notifications in your Concept Talk account:</p>

    <table width="100%" cellpadding="0" cellspacing="0">
      ${itemsHtml}
    </table>

    <div style="margin-top:20px; text-align:center;">
      <a href="${frontendUrl}/notifications"
         style="display:inline-block;
                padding:12px 24px;
                background-color:#007bff;
                color:#ffffff;
                text-decoration:none;
                border-radius:5px;
                font-weight:bold;">
        View all notifications
      </a>
    </div>

    <p style="margin-top:30px; font-size:12px; color:#999;">
      You’re receiving this email because you have unread notifications.
      You can manage email preferences in your account settings.
    </p>
  </div>
  `;
}

  
function generateVerificationEmailTemplate(verifyUrl:string) {
  return `
  <div style="font-family: Arial, sans-serif; color: #333;">
    <h2 style="color: #ffe371;">Welcome to Concept Talk 🎓</h2>
    <p>Thank you for signing up! Please verify your email address to activate your account.</p>
    
    <a href="${verifyUrl}" 
       style="display:inline-block;
              padding:10px 20px;
              margin-top:10px;
              background-color:#007bff;
              color:white;
              text-decoration:none;
              border-radius:5px;">
      Verify Email
    </a>

    <p style="margin-top:20px; font-size:14px; color:#666;">
      Or copy and paste this link into your browser:<br>
      <a href="${verifyUrl}" style="color:#007bff;">${verifyUrl}</a>
    </p>

    <p style="margin-top:30px; font-size:12px; color:#999;">
      If you didn’t create an account, you can safely ignore this email.
    </p>
  </div>
  `;
}
