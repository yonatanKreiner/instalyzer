const express = require('express');

const router = require('./src');

const app = express();

app.use('/', router);

app.listen(3000, () => {
	console.log('listening on 3000'); //eslint-disable-line no-console
});