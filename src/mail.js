const nodemailer = require('nodemailer');
const getReport = require('./hypeauditor');;

const createMailOptions = async (account, fromAddress, toAddress) => {
	const text = await getReport(account);

	return {
		from: fromAddress,
		to: toAddress,
		subject: 'דו"ח Instalyzer.co.il',
		html: text,
	};
};


const sendMail = async (toAddress, account, cb) => {
	const fromAddress = 'instalyzeril@gmail.com';

	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: fromAddress,
			pass: 'Aa123456!'
		}
	});

	const mailOptions = await createMailOptions(account, fromAddress, toAddress);

	transporter.sendMail(mailOptions, (err) => {
		if (err) {
			cb(err);
		} else {
			cb(null, `A report for account ${account} with percentage ${fakeRate} was sent to ${toAddress}`);
		}
	});
};

module.exports = sendMail;