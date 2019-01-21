const getReport = require('./hypeauditor');
const sendEmailWithAttachments = require('./email-service').sendEmailWithAttachments;

const REPORT_SUBJECT = 'דו"ח Instalyzer.co.il';

const sendReportByMail = async (toAddress, account) => {
	const reportPdfPath = await getReport(account);
	if (reportPdfPath) {
		sendEmailWithAttachments(toAddress, REPORT_SUBJECT, 'הדו"ח מוכן ומצורף כקובץ למייל', [{ path: reportPdfPath }]);
	}
};

module.exports = sendReportByMail;
