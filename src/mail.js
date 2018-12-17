const nodemailer = require('nodemailer');

const sendMail = (address, cb) => {
	const mailAddress = 'instalyzeril@gmail.com';

	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: mailAddress,
			pass: 'Aa123456!'
		}
	});
      
	const mailOptions = {
		from: mailAddress,
		to: address,
		subject: 'Instalyzer Report',
		text: 'These are the results for your last search.'
	};
      
	transporter.sendMail(mailOptions, (err, info) => {
		if (err) {
			cb(err);
		} else {
			cb(null, info.response);
		}
	});
};

module.exports = sendMail;