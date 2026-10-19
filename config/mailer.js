const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === "true" || false,
  auth: {
    user: process.env.EMAIL_USER || "olatunjiabass01@gmail.com",
    pass: process.env.EMAIL_PASS || "bmzujtdtzvgvkhjo",
  },
});

transporter
  .verify()
  .then(() => {
    console.log("SMTP connection successful");
  })
  .catch((error) => {
    console.error("SMTP connection failed:", error);
  });

const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
    });
    console.log("Email sent:", info);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = { sendEmail };
