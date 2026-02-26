const nodemailer = require("nodemailer");

/**
 * Email Provider (Nodemailer)
 * Alternative way to receive OTP on phone via email notification.
 */
class EmailProvider {
  constructor(config) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
    this.from = config.from;
    this.targetEmail = config.targetEmail;
  }

  async sendSms(mobile, message) {
    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to: this.targetEmail || `${mobile}@example.com`, // Fallback
        subject: "Your SUVIDHA OTP",
        text: message,
      });

      console.log(`[Email] OTP sent to ${this.targetEmail}. Msg ID: ${info.messageId}`);
      return { success: true, sid: info.messageId };
    } catch (error) {
      console.error(`[Email Error] ${error.message}`);
      throw new Error(`Email delivery failed: ${error.message}`);
    }
  }
}

module.exports = EmailProvider;
