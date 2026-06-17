import twilio from 'twilio';

let client = null;

const getTwilioClient = () => {
  if (!client) {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    
    if (!sid || !token || sid === 'your_twilio_account_sid') {
      return null;
    }
    client = twilio(sid, token);
  }
  return client;
};

export default getTwilioClient;