const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const router = require('./src');

const app = express();

const port = 3001;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/', router);

app.listen(port, '0.0.0.0', () => {
	console.log('listening on ' + port);
});