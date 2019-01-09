const axios = require('axios');
const qs = require('qs');
const db = require('./db');

const sandbox = {
	url: 'https://api.sandbox.paypal.com/v1/',
	clientId: 'AaJNf3KNzwZbv_0Wd51AYdq_7t-QpvBw4kP4xp2c6Xbehr5xj0kApOlAKa7SdNWJqBhOCa4waFp5Ijb-',
	secret: 'EJyCOnUuZl2a41mULWemQdiEtNLM96Ay1xtb2TsZOEzUPazja6oxnLxVyo4WEYekvX2vXxkdF4wypMuG'
};

const live = {
	url: 'https://api.sandbox.paypal.com/v1/',
	clientId: 'AeXtb1bhbpeUG1Kwq_fEJC3A8wMZcAWCPjqj8ofYQqzSeeche1wwECi7XCRtd5U7Th43ArIPEfnOFvlF',
	secret: 'EIvd5WAgUwQ8uyry8Cn01J4rBQ6_az4JwlTOn1EKcu2HJ3MGkNWSDxvjiQKDvYpBskAwBy5m6X-2ylMn'
};

const authorizeRequest = async () => {
	try {
		const body = {grant_type: 'client_credentials'};
		
		const res = await axios.post(sandbox.url + 'oauth2/token',
			qs.stringify(body), {
				headers: {
					'Accept': 'application/json',
					'Accept-Language': 'en_US' 
				},
				auth: {
					username: sandbox.clientId,
					password: sandbox.secret
				}
			});
		return  res.data.access_token;
	} catch (err) {
		db.log('could not authorize paypal api', err);
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
			db.log('could not validate payment', err);
			return false;
		}
	}	
};

const getPaymentInfo = async (id, token) => {
	const res = await axios.get(`${sandbox.url}payments/payment/${id}`, { headers: { 'Authorization': `Bearer ${token}` }});

	const paymentInfo = {
		id: res.data.id,
		state: res.data.state,
		user: {
			status: res.data.payer.status,
			email: res.data.payer.payer_info.email
		},
		ammount: {
			total: res.data.transactions[0].amount.total,
			currency: res.data.transactions[0].amount.currency
		},
		timestamp: res.data.create_time
	};

	if (paymentInfo.state === 'approved' && paymentInfo.ammount.total === 20 && paymentInfo.ammount.currency === 'ILS') {
		const oldPayment = await db.findById('payments', paymentInfo.id);

		if (oldPayment) {
			db.log(`user ${paymentInfo.user.email} tried to purchase with old payment id ${paymentInfo.id}`);
			return false;
		}

		db.insert('payments', paymentInfo);
		return true;
	} else {
		db.log(`a payment with id: ${paymentInfo.id} has beed denied`);
		return false;
	}
};

module.exports = { validatePayment };
