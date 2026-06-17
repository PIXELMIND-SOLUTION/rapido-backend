import getTwilioClient from '../config/twilio.js';

const USE_DEFAULT_OTP = true;

class OTPService {
  static generate() {
    if (USE_DEFAULT_OTP) {
      return "123456";
    }
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static expiryDate() {
    return new Date(Date.now() + 5 * 60 * 1000);
  }

  static async send(phoneNumber, otp, context = 'verification') {
    const message = `Your Rapido ${context} OTP is: ${otp}. Valid for 5 minutes.`;

    if (USE_DEFAULT_OTP) {
      console.log(`\n📱 OTP for ${phoneNumber}: ${otp}\n`);
      return { success: true };
    }

    const client = getTwilioClient();
    if (!client) {
      console.log(`\n📱 OTP for ${phoneNumber}: ${otp}\n`);
      return { success: true };
    }

    try {
      await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
      return { success: true };
    } catch (error) {
      console.log(`\n📱 OTP for ${phoneNumber}: ${otp}\n`);
      return { success: true };
    }
  }

  static validate(storedOtp, inputOtp) {
    if (!storedOtp || !storedOtp.code) {
      return { valid: false, message: 'OTP not found. Request new OTP.' };
    }
    if (new Date() > storedOtp.expiresAt) {
      return { valid: false, message: 'OTP expired. Request new OTP.' };
    }
    if (storedOtp.code !== String(inputOtp)) {
      return { valid: false, message: 'Invalid OTP.' };
    }
    return { valid: true };
  }
}

export default OTPService;