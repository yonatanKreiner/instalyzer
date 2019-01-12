const axios = require('axios');
const qs = require('qs');
const db = require('./db');
const logger = require('./logger');

const getPayPalConfig = () => ({
	url: process.env.PAYPAL_URL,
	clientId: process.env.PAYPAL_CLIENT,
	secret: process.env.PAYPAL_SECRET
});

const authorizeRequest = async () => {
	try {
		const paypal = getPayPalConfig();
		const body = { grant_type: 'client_credentials' };

		const res = await axios.post(paypal.url + 'oauth2/token',
			qs.stringify(body), {
				headers: {
					'Accept': 'application/json',
					'Accept-Language': 'en_US'
				},
				auth: {
					username: paypal.clientId,
					password: paypal.secret
				}
			});
		return res.data.access_token;
	} catch (err) {
		logger.error('could not authorize paypal api', err);
	}
};

const validatePayment = async id => {
	const token = await authorizeRequest();

	if (!token) {
		return false;
	} else {
		try {
			return getPaymentInfo(id, token);
		} catch (err) {
			logger.error('could not validate payment', err);
			return false;
		}
	}
};

const getPaymentInfo = async (id, token) => {
	const paypal = getPayPalConfig();
	const res = await axios.get(`${paypal.url}payments/payment/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });

	const paymentInfo = {
		id: res.data.id,
		state: res.data.state,
		user: {
			status: res.data.payer.status,
			email: res.data.payer.payer_info.email
		},
		amount: {
			total: res.data.transactions[0].amount.total,
			currency: res.data.transactions[0].amount.currency
		},
		timestamp: res.data.create_time
	};

	if (paymentInfo.state === 'approved' && paymentInfo.amount.total === 20 && paymentInfo.amount.currency === 'ILS') {
		const oldPayment = await db.findById('payments', paymentInfo.id);

		if (oldPayment) {
			logger.info(`user ${paymentInfo.user.email} tried to purchase with old payment id ${paymentInfo.id}`, paymentInfo);
			return false;
		}

		db.insert('payments', paymentInfo);
		return true;
	} else {
		logger.info(`a payment with id: ${paymentInfo.id} has beed denied`, paymentInfo);
		return false;
	}
};

module.exports = { validatePayment };
