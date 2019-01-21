const logger = require('./logger');
const pdf = require('html-pdf');

const htmlToPdfPromise = (pdfPath, htmlText) => {
	const options = {};
	return new Promise((resolve, reject) => {
		pdf.create(htmlText, options).toFile(pdfPath, (err, res) => {
			const obj = { html: htmlText, pdfPath: pdfPath };
			if (err) {
				logger.error('failed generating pdf', obj);
			} else {
				logger.info('successfuly generated pdf', obj);
			}
			resolve();
		})
	});
}

const htmlToPdf = async (pdfPath, htmlText) => {
	await htmlToPdfPromise(pdfPath, htmlText);
}

module.exports = htmlToPdf;
