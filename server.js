const express = require('express');

const router = require('./src');

const app = express();

app.use('/', router);

app.listen(80, () => {
	console.log('listening on 80'); //eslint-disable-line no-console
});