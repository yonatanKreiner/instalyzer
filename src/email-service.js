const nodemailer = require('nodemailer');
const logger = require('./logger');

const sendEmail = async (toAddress, subject, message, isHtml, attachments) => {
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.MAIL_ADDRESS,
			pass: process.env.MAIL_PASSWORD,
		}
	});

	let mailOptions = {
		from: process.env.MAIL_ADDRESS,
		to: toAddress,
		subject: subject,
	};
	if (isHtml) {
		mailOptions.html = message;
	} else {
		mailOptions.text = message;
	}

	mailOptions.attachments = attachments;

	return new Promise((resolve, reject) => {
		transporter.sendMail(mailOptions, (err) => {
			if (err) {
				logger.error('failed sending email', {
					...mailOptions,
					errorMessage: JSON.stringify(err),
				});
			} else {
				logger.info('successfuly sent email', mailOptions);
			}
			resolve();
		});
	});
};

const sendTextEmail = async (toAddress, subject, message) => {
	await sendEmail(toAddress, subject, message, false);
};

const sendHtmlEmail = async (toAddress, subject, message) => {
	await sendEmail(toAddress, subject, message, true);
};

const sendEmailWithAttachments = async (toAddress, subject, message, attachments) => {
	await sendEmail(toAddress, subject, message, false, attachments)
}

module.exports = {
	sendTextEmail,
	sendHtmlEmail,
	sendEmailWithAttachments,
};
