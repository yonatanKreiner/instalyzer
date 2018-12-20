const nodemailer = require('nodemailer');

const createMailOptions = (account, fakeRate, fromAddress, toAddress) => {
	const text = fakeRate
		? `היי משתמש Instalyzer יקר,
הדו"ח שביקשת מוכן:

אחוז העוקבים המזוייפים / הלא פעילים של משתמש האינסטגרם ${account} הוא - ${fakeRate}%.

אנו מודים לך על שיתוף הפעולה!`
		: `היי משתמש Instalyzer יקר.
היתה תקלה ביצירת דו"ח עבור משתמש האינסטגרם ${account}

אנו מתנצלים, אנא נסו שוב בעוד מספר דקות.`;

	return {
		from: fromAddress,
		to: toAddress,
		subject: 'דו"ח Instalyzer.co.il',
		text: text,
	};
};


const sendMail = async (toAddress, account, fakeRate, cb) => {
	const fromAddress = 'instalyzeril@gmail.com';

	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: fromAddress,
			pass: 'Aa123456!'
		}
	});

	const mailOptions = createMailOptions(account, fakeRate, fromAddress, toAddress);

	transporter.sendMail(mailOptions, (err) => {
		if (err) {
			cb(err);
		} else {
			cb(null, `A report for account ${account} with percentage ${fakeRate} was sent to ${toAddress}`);
		}
	});
};

module.exports = sendMail;