const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

require('dotenv').config();

const router = require('./src');

const app = express();

app.set('port', process.env.PORT || 3001);

app.use(cors({
	origin: process.env.ORIGIN,
	optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/health', (req, res) => {
	res.send('OK');
});
app.use('/', router);

app.listen(app.get('port'), () => {
	console.log('listening on ' + app.get('port'));
});
