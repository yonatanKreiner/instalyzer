const nodemailer = require('nodemailer');
const logger = require('./logger');

const sendEmail = async (toAddress, subject, message, isHtml, attachments) => {
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.SENDER_MAIL_ADDRESS,
			pass: process.env.SENDER_MAIL_PASSWORD,
		}
	});

	let mailOptions = {
		from: process.env.SENDER_MAIL_ADDRESS,
		to: toAddress,
		subject: subject,
	};
	if (isHtml) {
		mailOptions.html = message;
	} else {
		mailOptions.text = message;
	}

	mailOptions.attachments = attachments;

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

const sendEmailWithAttachments = async(toAddress, subject, message, attachments) => {
	sendEmail(toAddress, subject, message, false, attachments)
}

module.exports = {
	sendTextEmail,
	sendHtmlEmail,
	sendEmailWithAttachments,
};
