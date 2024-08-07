require('dotenv').config();
const axios = require('axios');
const twilio = require('twilio');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid,authToken);
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
const clinikoApiKey = process.env.CLINIKO_API_KEY;


