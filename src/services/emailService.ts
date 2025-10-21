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
  async sendVerificationEmail(email:string, token:string) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("⚠️ SMTP credentials are not set. Skipping email sending.");
      return;
    }

    const verifyUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${token}`;

    const mailOptions = {
      from: `"EduPortal" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Verify your email address - EduPortal",
      html: generateVerificationEmailTemplate(verifyUrl),
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Verification email sent to ${email}`);
    } catch (err) {
      console.error("❌ Error sending verification email:", err);
      throw { status: 500, message: "Failed to send verification email" };
    }
  },
};

function generateVerificationEmailTemplate(verifyUrl:string) {
  return `
  <div style="font-family: Arial, sans-serif; color: #333;">
    <h2 style="color: #007bff;">Welcome to EduPortal 🎓</h2>
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
