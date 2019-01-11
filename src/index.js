const express = require('express');
const instagram = require('./instagram');
const sendReportByMail = require('./report');
const sendContactMessageByMail = require('./contact');
const logger = require('./logger');
const paypal = require('./paypal');

const validators = require('./validators');
const isEmailAddressValid = validators.isEmailAddressValid;
const isStringNullOrEmpty = validators.isStringNullOrEmpty;

const router = express.Router();

const buildRequestJson = (req) => JSON.stringify({
	method: req.method,
	path: req.path,
	headers: req.headers,
	body: req.body,
	ip: req.ip
});

const logErrorRequestMessage = (message, req, res) => {
	const requestJson = buildRequestJson(req);
	logger.error(message, requestJson);
	res.status(400).send(message);
}

router.get('/account/:id/data', async (req, res, next) => {
	try {
		res.send(await instagram.getAccount(req.params.id));
	} catch (err) {
		next(err);
	}
});

router.get('/accounts', async (req, res, next) => {
	try {
		res.send(await instagram.searchAccounts(req.query.query));
	} catch (err) {
		next(err);
	}
});

router.get('/popular', async (req, res, next) => {
	try {
		res.send(await instagram.getPopularSearches());
	} catch (err) {
		next(err);
	}
});

router.post('/report', async (req, res, next) => {
	try {
		if (paypal.validatePayment(req.body.paymentId)) {
			if (req && req.body) {
				const { mail, account } = req.body;

				if (isStringNullOrEmpty(account)) {
					logErrorRequestMessage('no account', req, res);
				} else if (isStringNullOrEmpty(mail)) {
					logErrorRequestMessage('no message', req, res);
				} else if (!isEmailAddressValid(mail)) {
					logErrorRequestMessage('email address not valid', req, res);
				} else {
					await sendReportByMail(mail, account)
					send('OK');
				}
			}
		} else {
			res.status(400).send('payment could not be validated');
		}
	} catch (err) {

		next(err);
	}
});

router.get('/testmeir', async(req,res,next) => {
	if(process && process.env) {
		res.send(JSON.stringify(process.env));
	}
});

router.post('/contact', async (req, res, next) => {
	try {
		if (req && req.body) {
			const { email, message, fullname } = req.body;

			if (isStringNullOrEmpty(fullname)) {
				logErrorRequestMessage('no fullname', req, res);
			} else if (isStringNullOrEmpty(message)) {
				logErrorRequestMessage('no message', req, res);
			} else if (isStringNullOrEmpty(email)) {
				logErrorRequestMessage('no message', req, res);
			} else if (!isEmailAddressValid(email)) {
				logErrorRequestMessage('email address not valid', req, res);
			} else {
				await sendContactMessageByMail(email, fullname, message)
				res.send('OK');
			}
		} else {
			logErrorRequestMessage('request not valid', req, res);
		}
	} catch (err) {
		next(err);
	}
});

// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
	logger.error(err, buildRequestJson(req));
	res.status(500).send('internal server error');
});

module.exports = router;
