const twilio = require("twilio");

class TwilioProvider {
  constructor(config) {
    this.client = twilio(config.accountSid, config.authToken);
    this.from = config.from;
  }

  async sendSms(mobile, message) {
    try {
      // Ensure mobile is in E.164 format for Twilio (e.g., +91XXXXXXXXXX)
      const formattedMobile = mobile.startsWith("+") ? mobile : `+91${mobile}`;
      
      const response = await this.client.messages.create({
        body: message,
        from: this.from,
        to: formattedMobile
      });

      console.log(`[Twilio] SMS sent. SID: ${response.sid}`);
      return { success: true, sid: response.sid };
    } catch (error) {
      console.error(`[Twilio Error] ${error.message}`);
      throw new Error(`SMS delivery failed: ${error.message}`);
    }
  }
}

module.exports = TwilioProvider;
