const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.HOST_NAME,
  port: process.env.EMAIL_PORT,
  // service: 'gmail',
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (email, subject, message, link, buttonText) => {
  try {
    // Render the email template
    const templatePath = path.join(__dirname, "./templates/emailTemplate.ejs");
    const html = await ejs.renderFile(templatePath, {
      subject,
      message,
      link,
      buttonText,
    });

    // Send the email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error(`Error sending email: ${error.message}`);
  }
};

const sendVerificationEmail = async (email, verificationLink) => {
  const subject = "Verify Your Email";
  const message = "Click the button below to verify your email address:";
  const buttonText = "Verify Email";
  await sendEmail(email, subject, message, verificationLink, buttonText);
};

const sendPasswordResetEmail = async (email, resetLink) => {
  const subject = "Password Reset";
  const message = "Click the button below to reset your password:";
  const buttonText = "Reset Password";
  await sendEmail(email, subject, message, resetLink, buttonText);
};

/**
 * Send bulk email to multiple recipients
 * @param {Array<string>} emails - List of email addresses
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML content for the email body
 * @returns {Promise<void>}
 */
const sendBulkEmail = async (emails, subject, htmlContent) => {
  try {
    if (!Array.isArray(emails) || emails.length === 0) {
      throw new Error("At least one email recipient is required");
    }

    // Send email to multiple recipients using BCC
    const mailOptions = {
      from: process.env.EMAIL_USER,
      bcc: emails, // Use BCC to hide recipients from each other
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error(`Error sending bulk email: ${error.message}`);
  }
};




module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendBulkEmail,
  sendEmail
};
