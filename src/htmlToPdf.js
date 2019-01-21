const HTML5ToPDF = require('html5-to-pdf');

const htmlToPdf = async (filePath) => {
	const htmlPath = filePath + '.html';
	const pdfPath = filePath + '.pdf';

	const html2pdf = new HTML5ToPDF({
		inputPath: htmlPath,
		outputPath: pdfPath,
		printBackground: true,
		options: {
			printBackground: true,
		}
	});

	await html2pdf.start();
	await html2pdf.build();
	await html2pdf.close();
}

module.exports = htmlToPdf;
