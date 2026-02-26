class MockProvider {
  async sendSms(mobile, message) {
    console.log(`[SMS Mock] To: ${mobile} | Msg: ${message}`);
    return { success: true, sid: `mock_${Date.now()}` };
  }
}

module.exports = MockProvider;
