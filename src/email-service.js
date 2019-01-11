const nodemailer = require('nodemailer');
const logger = require('./logger');

// TODO: Need to encrypt these / env vars
const SENDER_MAIL_ADDRESS = process.env.SENDER_MAIL_ADDRESS;
const SENDER_MAIL_PASSWORD = process.env.SENDER_MAIL_PASSWORD;
const EMAIL_SERVICE = 'gmail';

const sendEmail = async (toAddress, subject, message, isHtml) => {
	const transporter = nodemailer.createTransport({
		service: EMAIL_SERVICE,
		auth: {
			user: SENDER_MAIL_ADDRESS,
			pass: SENDER_MAIL_PASSWORD,
		}
	});

	let mailOptions = {
		from: SENDER_MAIL_ADDRESS,
		to: toAddress,
		subject: subject,
	}
	if (isHtml) {
		mailOptions.html = message;
	} else {
		mailOptions.text = message;
	}

	transporter.sendMail(mailOptions, (err) => {
		if (err) {
			logger.error('failed sending email', {
				...mailOptions,
				errorMessage: JSON.stringify(err),
			});
		} else {
			logger.info('successfuly sent email', mailOptions);
		}
	});
};

const sendTextEmail = async (toAddress, subject, message) => {
	sendEmail(toAddress, subject, message, false);
};

const sendHtmlEmail = async (toAddress, subject, message) => {
	sendEmail(toAddress, subject, message, true);
};

module.exports = {
	sendTextEmail,
	sendHtmlEmail,
};
