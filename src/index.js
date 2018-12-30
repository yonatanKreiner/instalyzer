const express = require('express');
const instagram = require('./instagram');
const sendMail = require('./mail');

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
	new Promise(async (reslove, reject) => {
		sendMail(req.body.mail, req.body.account, (err, data) => {
			if (err) {
				reject(err.message);
			}
	
			reslove(data);
		});
	}).then(console.log).catch(next);

	res.send('OK');
});

// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
	console.error(err.message);
	res.status(500).send('Server error');
});

module.exports = router;