const TwilioProvider = require("./twilioProvider");
const MockProvider = require("./mockProvider");
const Fast2SmsProvider = require("./fast2smsProvider");
const EmailProvider = require("./emailProvider");

/**
 * Factory to get the SMS provider based on the environment configuration.
 * Toggle via SMS_PROVIDER=twilio | fast2sms | email | mock
 */
function getSmsProvider() {
  const providerType = (process.env.SMS_PROVIDER || "mock").toLowerCase();

  switch (providerType) {
    case "twilio":
      if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
        console.warn("[SMS Provider] Twilio keys missing, falling back to Mock.");
        return new MockProvider();
      }
      return new TwilioProvider({
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        from: process.env.TWILIO_PHONE_NUMBER
      });

    case "fast2sms":
      if (!process.env.FAST2SMS_API_KEY) {
        console.warn("[SMS Provider] Fast2SMS API key missing, falling back to Mock.");
        return new MockProvider();
      }
      return new Fast2SmsProvider(process.env.FAST2SMS_API_KEY);

    case "email":
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("[SMS Provider] Email credentials missing, falling back to Mock.");
        return new MockProvider();
      }
      return new EmailProvider({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: parseInt(process.env.EMAIL_PORT || "465"),
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        targetEmail: process.env.TARGET_EMAIL
      });

    case "mock":
    default:
      return new MockProvider();
  }
}

module.exports = { getSmsProvider };
