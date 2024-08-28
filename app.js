import dotenv from 'dotenv';
import axios from 'axios';
// import twilio from 'twilio';

dotenv.config();

// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = twilio(accountSid,authToken);
// const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
const clinikoApiKey = process.env.CLINIKO_API_KEY;

const today = new Date() // get today's date
const tomorrow = new Date(today)
tomorrow.setDate(today.getDate() + 1) // Add 1 to today's date and set it to tomorrow
const formatDate = (date) => date.toISOString().split('T')[0];

const formattedToday = formatDate(today);
const formattedTomorrow = formatDate(tomorrow);

const fetchBookings = async () => {
    try {

        const query = new URLSearchParams({
            order: 'asc',
            page: '0',
            per_page: '100',
            'q[]': 'string',
            sort: "starts_at",
          }).toString();

        const encodedApiKey = btoa(`${clinikoApiKey}:`);

        const response = await axios.get(`https://api.au2.cliniko.com/v1/bookings?`, {
            headers: {
                'Authorization': `Basic ${encodedApiKey}`,
                'Accept': 'application/json',
                'User-Agent': 'Cliniko-to-Whatsapp API (ianchiro.frontdesk@gmail.com)',
            },
        });
    
        // Log the response data to see if the fetch is successful
        console.log('Bookings fetched successfully:', response.data);
        return response.data.bookings;
    } catch (error) {
        console.error('Error fetching bookings:', error.message);
        return null;
    }
  };

  const main = async () => {
    await fetchBookings();
  };
  
  main(); // Run the main function