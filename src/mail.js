const nodemailer = require('nodemailer');
const checkAccount = require('./igaudit');

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
}


const sendMail = async (address, account, cb) => {
	const mailAddress = 'instalyzeril@gmail.com';

	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: mailAddress,
			pass: 'Aa123456!'
		}
	});

	cb(null);

	let result = null;
	let retries = 5;
	while (!result && retries > 0) {
		result = await checkAccount(account);
	}

	const mailOptions = createMailOptions(account, result, mailAddress, address);
	if (result) {
		transporter.sendMail(mailOptions, (err, info) => {
			if (err) {
				console.log(err);
			} else {
				console.log(`A report for account ${account} with percentage ${result} was sent to ${address}`);
				console.log(info);
			}
		});
	} else {
		console.error(`There is a problem with result field: result = ${result}`);
	}
};

module.exports = sendMail;