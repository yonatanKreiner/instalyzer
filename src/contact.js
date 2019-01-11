const sendTextEmail = require('./email-service').sendTextEmail;

const REPORT_SUBJECT = 'יצירת קשר דרך האתר';
const TO_EMAIL = 'instalyzeril@gmail.com';

const sendContactMessageByMail = async (emailAddress, name, message) => {
	sendTextEmail(TO_EMAIL, REPORT_SUBJECT, JSON.stringify({ emailAddress, name, message }));
};

module.exports = sendContactMessageByMail;
