const express = require('express');
const checkAccount = require('./igaudit');
const instagram = require('./instagram');
const sendMail = require('./mail');

const router = express.Router();

// router.get('/account/:id', async (req, res) => {
// 	res.send(await checkAccount(req.params.id));
// });

router.get('/account/:id/data', async (req, res) => {
	res.send(await instagram.getAccount(req.params.id));
});

router.get('/accounts', async (req, res) => {
	res.send(await instagram.searchAccounts(req.query.query));
});

router.get('/popular', async (req, res) => {
	res.send(await instagram.getPopularSearches());
});

router.post('/report', async(req, res) => {
	sendMail(req.body.mail, req.body.account, (err) => {
		if (err) {
			res.status(500).send('Server error');
		}

		res.send('OK');
	});
});

module.exports = router;