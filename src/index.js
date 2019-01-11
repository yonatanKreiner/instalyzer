const express = require('express');
const instagram = require('./instagram');
const sendReportByMail = require('./report');
const sendContactMessageByMail = require('./contact');
const db = require('./db');
const paypal = require('./paypal');

const validators = require('./validators');
const isEmailAddressValid = validators.isEmailAddressValid;
const isStringNullOrEmpty = validators.isStringNullOrEmpty;

const router = express.Router();

const logRequestMessage = (message, req, res) => {
	const requestJson = JSON.stringify(
		{
			method: req.method,
			path: req.path,
			headers: req.headers,
			body: req.body,
			ip: req.ip
		});
	db.log(message, requestJson);
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
					logRequestMessage('no account', req, res);
				} else if (isStringNullOrEmpty(mail)) {
					logRequestMessage('no message', req, res);
				} else if (!isEmailAddressValid(mail)) {
					logRequestMessage('email address not valid', req, res);
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

router.post('/contact', async (req, res, next) => {
	try {
		if (req && req.body) {
			const { email, message, fullname } = req.body;

			if (isStringNullOrEmpty(fullname)) {
				logRequestMessage('no fullname', req, res);
			} else if (isStringNullOrEmpty(message)) {
				logRequestMessage('no message', req, res);
			} else if (isStringNullOrEmpty(email)) {
				logRequestMessage('no message', req, res);
			} else if (!isEmailAddressValid(email)) {
				logRequestMessage('email address not valid', req, res);
			} else {
				await sendContactMessageByMail(email, fullname, message)
				res.send('OK');
			}
		} else {
			logRequestMessage('request not valid', req, res);
		}
	} catch (err) {
		next(err);
	}
});

// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
	db.log(err, JSON.stringify({ request: req }));
	res.status(500).send('internal server error');
});

module.exports = router;
