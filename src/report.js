const getReport = require('./hypeauditor');
const sendEmailWithAttachments = require('./email-service').sendEmailWithAttachments;
const util = require('util');
const fs = require('fs');

const unlink = util.promisify(fs.unlink);

const REPORT_SUBJECT = 'דו"ח Instalyzer.co.il';

const sendReportByMail = async (toAddress, account) => {
	const pdfPath = await getReport(account);

	if (pdfPath) {
		await sendEmailWithAttachments(toAddress, REPORT_SUBJECT, 'הדו"ח מוכן ומצורף כקובץ למייל', [{ path: pdfPath }]);
		await unlink(pdfPath);
	}
};

module.exports = sendReportByMail;
