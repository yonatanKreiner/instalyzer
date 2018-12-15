const express = require('express');

const cors = require('cors');

const router = require('./src');

const app = express();

const port = 3001;

app.use(cors());
app.use('/', router);

app.listen(port, () => {
	console.log('listening on ' + port); //eslint-disable-line no-console
});
