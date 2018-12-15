const express = require('express');
const checkAccount = require('./igaudit');

const router = express.Router();

router.get('/account/:id', async (req, res) => {
	res.send(await checkAccount(req.params.id));
});

module.exports = router;