const getReport = require('./hypeauditor');
const sendHtmlEmail = require('./email-service').sendHtmlEmail;

const REPORT_SUBJECT = 'דו"ח Instalyzer.co.il';

const sendReportByMail = async (toAddress, account) => {
	const report = await getReport(account);
	if (report) {
		sendHtmlEmail(toAddress, REPORT_SUBJECT, report);
	}
};

module.exports = sendReportByMail;
