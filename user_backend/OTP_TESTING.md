# OTP Flow Testing Guide

## 1. Prerequisites
- Ensure PostgreSQL is running and `DATABASE_URL` is set in `.env`.
- Run `npm install` in the `backend` folder.
- The `otps` table is automatically created on server start (see `src/server.js`).

## 2. API Endpoints

### A) Request OTP
**URL:** `POST /auth/otp/request`  
**Body:**
```json
{
  "mobile": "9988776655"
}
```
**Expected Response (Development/Mock):**
```json
{
  "ok": true,
  "message": "OTP sent successfully",
  "otp": "123456"
}
```
*Note: In production or with `SMS_PROVIDER=twilio`, the `otp` field is hidden.*

### B) Verify OTP
**URL:** `POST /auth/otp/verify`  
**Body:**
```json
{
  "mobile": "9988776655",
  "otp": "123456"
}
```
**Expected Response:**
```json
{
  "ok": true,
  "token": "JWT_TOKEN_HERE",
  "user": {
    "id": 1,
    "phone": "9988776655",
    "role": "citizen",
    "name": null
  }
}
```

## 3. Rate Limiting & Security Tests
1. **Request Limit:** Call `/auth/otp/request` 4 times within 10 minutes for the same number. The 4th call should return `429 Too Many Requests`.
2. **Verify Limit:** Call `/auth/otp/verify` with a wrong OTP 6 times. The 6th call should return `429 Too Many Requests`.
3. **Expiry:** Wait 5 minutes after requesting an OTP. Verifying it should return `410 OTP Expired`.
4. **Consumption:** Once an OTP is verified successfully, trying to verify it again should return `400 OTP already verified`.

## 4. Real SMS Integration
Toggle real SMS by setting the following in `.env`:
```env
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_twilio_number
```
If `SMS_PROVIDER` is set to `mock` (default) or left empty, OTPs will only be logged to the console.

## 5. Logs to Watch
- `[Twilio] SMS sent. SID: SM...` (in real SMS mode)
- `[SMS Mock] To: 9988776655 | Msg: Your SUVIDHA OTP is 123456. Valid for 5 minutes.` (in simulated mode)
- `[OTP DEBUG] For 9988776655: 123456` (in dev mode)
