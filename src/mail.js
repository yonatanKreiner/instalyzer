const nodemailer = require('nodemailer');

const createMailOptions = (account, reportPercentage, mailAddress, address) => {
	const text = reportPercentage
		? `היי משתמש Instalyzer יקר,
הדו"ח שביקשת מוכן:

אחוז העוקבים המזוייפים / הלא פעילים של משתמש האינסטגרם ${account} הוא - ${reportPercentage}%.

אנו מודים לך על שיתוף הפעולה!`
		: `היי משתמש Instalyzer יקר.
היתה תקלה ביצירת דו"ח עבור משתמש האינסטגרם ${account}

אנו מתנצלים, אנא נסו שוב בעוד מספר דקות.`;

	return {
		from: mailAddress,
		to: address,
		subject: 'דו"ח Instalyzer.co.il',
		text: text,
	};
};


const sendMail = async (address, account, data, cb) => {
	const mailAddress = 'instalyzeril@gmail.com';

	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: mailAddress,
			pass: 'Aa123456!'
		}
	});

	const mailOptions = createMailOptions(account, data, mailAddress, address);

	transporter.sendMail(mailOptions, (err) => {
		if (err) {
			cb(err);
		} else {
			cb(null, `A report for account ${account} with percentage ${data} was sent to ${address}`);
		}
	});
};

module.exports = sendMail;