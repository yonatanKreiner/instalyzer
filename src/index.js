const express = require('express');
const instagram = require('./instagram');
const sendMail = require('./mail');
const log = require('./log');

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
		sendMail(req.body.mail, req.body.account, (err, data) => {
			if (err) {
				log('failed sending mail', err);
			} else {
				log(data);
			}
		});
	
		res.send('OK');
	} catch (err) {
		next(err);
	}
});

// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
	log('an error has occured', err);
	res.status(500).send('internal server error');
});

module.exports = router;
