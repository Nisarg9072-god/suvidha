const axios = require("axios");

/**
 * Fast2SMS Provider
 * Used for sending SMS in India.
 */
class Fast2SmsProvider {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.url = "https://www.fast2sms.com/dev/bulkV2";
  }

  async sendSms(mobile, message) {
    try {
      // Fast2SMS expects 10 digit number without +91 for India
      const cleanedMobile = mobile.startsWith("+91") ? mobile.substring(3) : mobile;
      
      const response = await axios.get(this.url, {
        params: {
          authorization: this.apiKey,
          route: "otp",
          variables_values: message.match(/\d+/)[0], // Extract OTP digits if possible
          numbers: cleanedMobile,
        }
      });

      if (response.data.return) {
        console.log(`[Fast2SMS] OTP sent to ${cleanedMobile}. Request ID: ${response.data.request_id}`);
        return { success: true, sid: response.data.request_id };
      } else {
        throw new Error(response.data.message || "Fast2SMS failed to send");
      }
    } catch (error) {
      console.error(`[Fast2SMS Error] ${error.response?.data?.message || error.message}`);
      throw new Error(`Fast2SMS delivery failed: ${error.message}`);
    }
  }
}

module.exports = Fast2SmsProvider;
