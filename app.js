import dotenv from 'dotenv';
import axios from 'axios';
import twilio from 'twilio';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid,authToken);
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
const clinikoApiKey = process.env.CLINIKO_API_KEY;

const patientIds=[];
const patientPhoneNumbers=[];
const patientAppointmentTimes=[];
const patientNames=[]

const today = new Date() // get today's date
const tomorrow = new Date(today)
tomorrow.setDate(today.getDate() + 1) // Add 1 to today's date and set it to tomorrow
const formatDate = (date) => date.toISOString().split('T')[0];
const formattedTomorrow = formatDate(tomorrow);

function createAuthenticationHeader(apiKey){
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
  const patientLink = booking.patient.links.self; // to get the links for the patient in order to get the patient's ID. example:"https://api.au2.cliniko.com/v1/patients/1134434436490729794"
  const patientId = patientLink.split('/').pop();
  
  // Making sure the timing is local timing
  const utcDate = new Date(booking.starts_at);
  const patientAppointmentTime = utcDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  console.log(`Name: ${patientName}, ID: ${patientId}, Appointment Time: ${patientAppointmentTime}`);
  patientNames.push(patientName);
  patientIds.push(patientId);
  patientAppointmentTimes.push(patientAppointmentTime);

};//logging the details to check

const logPhoneNumberDetails = (patientNumber)=>{
  
  const patientPhoneNumber = patientNumber.number;
  patientPhoneNumbers.push(patientPhoneNumber); 
  
  console.log(patientPhoneNumber);
  console.log(patientPhoneNumbers);
}

const fetchBookings = async (endDate) => {
    try {
    
      const response = await axios.get(`https://api.au2.cliniko.com/v1/individual_appointments?q[]=starts_at:>=${endDate}T00:00:00Z&q[]=starts_at:<=${endDate} T23:59:59Z`,{headers: createAuthenticationHeader(clinikoApiKey)});//the endpoint of the API for tomorrow's date

      // Log the response data to see if the fetch is successful
      // data.individual_appointments is an array (try to fetch the patient_name, id, start_at details)
      const appointments  = response.data.individual_appointments;
      
      appointments.map((booking) => {
        logBookingDetails(booking);
        // console.log(JSON.stringify(booking.patient.links.self));
      });
      
      // return response.data.bookings;
    } catch (error) {
        console.error('Error fetching bookings:', error.message);
        return null;
    }
  };//fetch the appointment made by patients the next day 


const fetchPhoneNumber = async(id)=>{

  try {
    const response = await axios.get(`https://api.au2.cliniko.com/v1/patients/${id}`,{headers: createAuthenticationHeader(clinikoApiKey)}); //can't use the id we got from fetchBookings. Under fetchBookings.data there's a data entry called patients, need to look into that
    const phoneNumbers = response.data.patient_phone_numbers; //phone number array for patients
    
    if (!phoneNumbers || phoneNumbers.length === 0) {
      patientPhoneNumbers.push(" "); // Push an empty string if no phone numbers
    } else {
      // If phoneNumbers exist, iterate and log each phone number
      phoneNumbers.map((phoneNumber) => {
        logPhoneNumberDetails(phoneNumber);
      });
    }

  } catch (error) {
    console.error('Error fetching phone number:', error.message);
    return null;
  }

};//fetch the phone number from the patient with their IDs

const sendWhatsAppMessage = async (phoneNumber, message) => {
  try {
    const response = await client.messages.create({
      from: `whatsapp:${whatsappNumber}`, // Sending from your Twilio WhatsApp number
      to: `whatsapp:${phoneNumber}`, // Sending to patient's WhatsApp number
      body: message, // Message content
    });

    console.log(`Message sent to ${phoneNumber}: ${response.sid}`);
    console.log(response);
  } catch (error) {
    console.error(`Failed to send message to ${phoneNumber}:`, error.message);
  }
};

const main = async () => {
  await fetchBookings(formattedTomorrow);
  // look all the patient's ID to the fetchPhoneNumber function to get all the phone numbers
  for (let i =0; i<patientIds.length ; i++){
    await fetchPhoneNumber(patientIds[i]);
  };
  sendWhatsAppMessage(`+60102793422`,"Hello");
  
};

main(); // Run the main function