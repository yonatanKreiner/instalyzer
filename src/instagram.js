const axios = require('axios');

const searchAccounts = async (account) => {
	try {
		const res = await axios.get('https://hypeauditor.com/suggest/?search=' + account, { headers: { 'x-requested-with': 'XMLHttpRequest' } });
		return res.data;
	} catch (err) {
		console.error(err.message);
	}
};

const getAccount = async (account) => {
	try {
		const res = await axios.post('https://fetcher.igaudit.io/users', {usernames: [account]});
		return res.data.data[0];
	} catch (err) {
		console.error(err.message);
	}
};

module.exports = { searchAccounts, getAccount };