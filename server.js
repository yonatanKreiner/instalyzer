const express = require('express');

const cors = require('cors');

const router = require('./src');

const app = express();

const port = 3001;

app.use(cors());
app.use('/', router);

app.listen(port, '0.0.0.0', () => {
	console.log('listening on ' + port); //eslint-disable-line no-console
});

process.on('unhandledRejection', (err) => { console.error(err.message); });