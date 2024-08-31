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

function authentication(apiKey){
  const encodedApiKey = btoa(`${apiKey}:`); // Decode the API key to a base64 decoder used for Authentication
  const headers = {
    'Authorization': `Basic ${encodedApiKey}`,
    'Accept': 'application/json',
    'User-Agent': 'Cliniko-to-Whatsapp API (ianchiro.frontdesk@gmail.com)',
  } 
  return headers;
}//Cliniko's basic Authentication

const logBookingDetails = (booking) => {
  const patientName = booking.patient_name;
  const patientId = booking.id;
  
  // Making sure the timing is local timing
  const utcDate = new Date(booking.starts_at);
  const appointmentTime = utcDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  console.log(`Name: ${patientName}, ID: ${patientId}, Appointment Time: ${appointmentTime}`);
};


const fetchBookings = async (endDate) => {
    try {
    
      const response = await axios.get(`https://api.au2.cliniko.com/v1/individual_appointments?q[]=starts_at:>=${endDate}T00:00:00Z&q[]=starts_at:<=${endDate} T23:59:59Z`,{headers: authentication(clinikoApiKey)});//the endpoint of the API for tomorrow's date

      // Log the response data to see if the fetch is successful
      // data.individual_appointments is an array (try to fetch the patient_name, id, start_at details)
      const bookings = response.data.individual_appointments;
      bookings.map((booking) => {
        logBookingDetails(booking);
      });
      
      // return response.data.bookings;
    } catch (error) {
        console.error('Error fetching bookings:', error.message);
        return null;
    }
  };


const fetchPhoneNumber = async()=>{

  try {
    const response = await axios.get(`https://api.au2.cliniko.com/v1/contacts/${"1496236805446441304"}`,{headers: authentication(clinikoApiKey)}); //can't use the id we got from fetchBookings. Under fetchBookings.data there's a data entry called patients, need to look into that
    console.log(response.data);
  } catch (error) {
    console.error('Error fetching bookings:', error.message);
    return null;
  }

};

const main = async () => {
  await fetchBookings(formattedTomorrow);
  await fetchPhoneNumber();
};

main(); // Run the main function