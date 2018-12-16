const express = require('express');
const checkAccount = require('./igaudit');
const instagram = require('./instagram');

const router = express.Router();

router.get('/account/:id', async (req, res) => {
	res.send(await checkAccount(req.params.id));
});

router.get('/account/:id/data', async (req, res) => {
	res.send(await instagram.getAccount(req.params.id));
});

router.get('/accounts', async (req, res) => {
	res.send(await instagram.searchAccounts(req.query.query));
});

module.exports = router;