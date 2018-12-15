const express = require('express');

const router = require('./src');

const app = express();

app.use('/', router);

app.listen(3001, () => {
	console.log('listening on 3001'); //eslint-disable-line no-console
});
