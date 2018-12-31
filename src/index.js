const express = require('express');
const instagram = require('./instagram');
const sendMail = require('./mail');
const db = require('./db');
const paypal = require('./paypal');

const router = express.Router();

router.get('/account/:id/data', async (req, res, next) => {
	try {
		res.send(await instagram.getAccount(req.params.id));
	} catch(err) {
		next(err);
	}
});

router.get('/accounts', async (req, res, next) => {
	try {
		res.send(await instagram.searchAccounts(req.query.query));
	} catch(err) {
		next(err);
	}
});

router.get('/popular', async (req, res, next) => {
	try {
		res.send(await instagram.getPopularSearches());
	} catch(err) {
		next(err);
	}
});

router.post('/report', async(req, res, next) => {
	try {
		if (paypal.validatePayment(req.body.paymentId)) {
			sendMail(req.body.mail, req.body.account, (err, data) => {
				if (err) {
					db.log('failed sending mail', err);
				} else {
					db.log(data);
				}
			});

			res.send('OK');
		} else {
			res.status(400).send('payment could not be validated');
		}
	} catch (err) {
		next(err);
	}
});

// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
	db.log('an error has occured', err);
	res.status(500).send('internal server error');
});

module.exports = router;
