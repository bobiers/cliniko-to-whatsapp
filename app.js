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

const formattedTomorrow = formatDate(tomorrow);

const fetchBookings = async (endDate) => {
    try {

      const encodedApiKey = btoa(`${clinikoApiKey}:`);
    
      const response = await axios.get(`https://api.au2.cliniko.com/v1/individual_appointments?q[]=starts_at:>=${endDate}T00:00:00Z&q[]=starts_at:<=${endDate} T23:59:59Z`,{ //the endpoint of the API for tomorrow's date
          headers: {
              'Authorization': `Basic ${encodedApiKey}`,
              'Accept': 'application/json',
              'User-Agent': 'Cliniko-to-Whatsapp API (ianchiro.frontdesk@gmail.com)',
          }, //Cliniko's basic Authentication
      });
  
      // Log the response data to see if the fetch is successful
      // data.individual_appointments is an array (try to fetch the patient_name, id, start_at details)
      const bookings = response.individual_appointments;
      bookings.forEach(element => {
        
      });
      console.log('Bookings fetched successfully:', response.data.individual_appointments);
      // return response.data.bookings;
    } catch (error) {
        console.error('Error fetching bookings:', error.message);
        return null;
    }
  };

  const main = async () => {
    await fetchBookings(formattedTomorrow);
  };
  
  main(); // Run the main function