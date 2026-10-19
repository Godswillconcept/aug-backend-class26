const { sendEmail } = require("../config/mailer");
class EmailService {
  static async sendPasswordResetEmail(user, otp) {
    try {
      const { email, first_name, last_name } = user;
      const subject = "Password Reset";
      const text = `Dear ${first_name} ${last_name},\n\n
      Your One Time Password is: ${otp}\n\n
      Thank you!`;

      const html = `<p>Dear ${first_name} ${last_name},</p>
        <p>Your One Time Password is: ${otp}</p>
        <p>Thank you!</p>`;
      await sendEmail(email, subject, text, html);
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = EmailService;
