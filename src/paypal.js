const axios = require('axios');
const db = require('./db');

const validatePayment = async id => {
	try {
		const url = 'https://api.sandbox.paypal.com/v1/payments/payment/';
		const res = await axios.get(url + id);
		return res.data.state === 'approved';
	} catch (err) {
		db.log('could not validate payment', err);
		return false;
	}
}

module.exports = { validatePayment };
