import formData from "form-data";
import Mailgun from "mailgun.js";

/**
 * Mailgun client for sending emails.
 * Used for OTP verification and invite notifications.
 */

// Validate environment variables on initialization
if (!process.env.MAILGUN_API_KEY) {
  console.error("ERROR: MAILGUN_API_KEY environment variable is not set");
}
if (!process.env.MAILGUN_DOMAIN) {
  console.error("ERROR: MAILGUN_DOMAIN environment variable is not set");
}
if (!process.env.MAILGUN_FROM_EMAIL) {
  console.error("ERROR: MAILGUN_FROM_EMAIL environment variable is not set");
}

const mailgun = new Mailgun(formData);

const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
});

/**
 * Send OTP verification email
 * @param {string} to - Recipient email address
 * @param {string} username - User's username
 * @param {string} otp - 6-digit OTP code
 */
export async function sendOTPEmail(to, username, otp) {
  try {
    // Validate inputs
    if (!to || !username || !otp) {
      console.error("Missing required parameters for sendOTPEmail:", {
        to,
        username,
        otp,
      });
      throw new Error("Missing required email parameters");
    }

    // Log email sending attempt (without sensitive data)
    console.log(`Attempting to send OTP email to: ${to.substring(0, 3)}***`);

    const result = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: `Cartmate <${process.env.MAILGUN_FROM_EMAIL}>`,
      to: [to],
      subject: "Verify Your Email - Cartmate",
      text: `Hi ${username},\n\nYour verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.\n\nBest regards,\nCartmate Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Verify Your Email</h2>
          <p>Hi <strong>${username}</strong>,</p>
          <p>Your verification code is:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333; border-radius: 8px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">Best regards,<br>Cartmate Team</p>
        </div>
      `,
    });

    console.log("OTP email sent successfully - Message ID:", result.id);
    return { success: true, messageId: result.id };
  } catch (error) {
    // Enhanced error logging for debugging
    console.error("=== Error sending OTP email ===");
    console.error("Error message:", error.message);
    console.error("Error details:", error);
    console.error("Mailgun config check:", {
      hasDomain: !!process.env.MAILGUN_DOMAIN,
      hasApiKey: !!process.env.MAILGUN_API_KEY,
      hasFromEmail: !!process.env.MAILGUN_FROM_EMAIL,
    });
    throw new Error("Failed to send verification email");
  }
}

/**
 * Send welcome email to new users
 * @param {string} to - Recipient email address
 * @param {string} username - User's username
 */
export async function sendWelcomeEmail(to, username) {
  try {
    const result = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: `Cartmate <${process.env.MAILGUN_FROM_EMAIL}>`,
      to: [to],
      subject: `Welcome to Cartmate, ${username}! 🎉`,
      text: `Hi ${username},\n\nWelcome to Cartmate! We're excited to have you join our community of smart shoppers.\n\nHere's what you can do to get started:\n• Create your first shopping list\n• Invite family and friends to collaborate\n• Organize items with priorities, tags, and due dates\n• Track prices and find the best deals\n\nDon't forget to verify your email address to unlock all features!\n\nHappy shopping!\nCartmate Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Welcome to Cartmate! 🎉</h1>
          <p style="font-size: 16px; color: #555;">Hi <strong>${username}</strong>,</p>
          <p style="color: #666; line-height: 1.6;">
            Welcome to Cartmate! We're excited to have you join our community of smart shoppers.
          </p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="color: #333; margin-bottom: 15px;">Get Started:</h3>
            <ul style="color: #666; padding-left: 20px;">
              <li style="margin-bottom: 8px;">📝 Create your first shopping list</li>
              <li style="margin-bottom: 8px;">👥 Invite family and friends to collaborate</li>
              <li style="margin-bottom: 8px;">🏷️ Organize items with priorities, tags, and due dates</li>
              <li style="margin-bottom: 8px;">💰 Track prices and find the best deals</li>
            </ul>
          </div>

          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="color: #856404; margin: 0;">
              <strong>⚠️ Important:</strong> Don't forget to verify your email address to unlock all features and start creating lists!
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://cartmate.app'}/dashboard"
               style="display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Start Shopping
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            Happy shopping!<br>
            <strong>Cartmate Team</strong>
          </p>
        </div>
      `,
    });

    console.log("Welcome email sent successfully:", result);
    return { success: true, messageId: result.id };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw new Error("Failed to send welcome email");
  }
}

/**
 * Send list invite notification email
 * @param {string} to - Recipient email address
 * @param {string} listName - Name of the list
 * @param {string} inviterName - Name of the person who sent the invite
 * @param {string} inviteUrl - Full URL to accept the invite
 */
export async function sendInviteEmail(to, listName, inviterName, inviteUrl) {
  try {
    const result = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: `Cartmate <${process.env.MAILGUN_FROM_EMAIL}>`,
      to: [to],
      subject: `You've been invited to join "${listName}" on Cartmate`,
      text: `Hi,\n\n${inviterName} has invited you to collaborate on the shopping list "${listName}".\n\nClick here to join: ${inviteUrl}\n\nBest regards,\nCartmate Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">You've been invited!</h2>
          <p><strong>${inviterName}</strong> has invited you to collaborate on the shopping list:</p>
          <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0; color: #555;">${listName}</h3>
          </div>
          <p>
            <a href="${inviteUrl}" style="display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Join List
            </a>
          </p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Or copy and paste this URL into your browser:<br>
            <a href="${inviteUrl}" style="color: #007bff; word-break: break-all;">${inviteUrl}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">Best regards,<br>Cartmate Team</p>
        </div>
      `,
    });

    console.log("Invite email sent successfully:", result);
    return { success: true, messageId: result.id };
  } catch (error) {
    console.error("Error sending invite email:", error);
    throw new Error("Failed to send invite email");
  }
}

/**
 * Generate a 6-digit OTP code
 */
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
