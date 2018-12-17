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
		const res = await axios.post('https://fetcher.igaudit.io/users', { usernames: [account] });
		const accountSearch = await searchAccounts(account);
		const filteredAccount = accountSearch.filter(function (accountItem) { return accountItem.username === account })[0];

		return ({
			username: filteredAccount.username,
			full_name: filteredAccount.full_name,
			avatar_url: filteredAccount.avatar_url,
			mediaPosts: res.data.data[0].mediaPosts,
			followingCount: res.data.data[0].followingCount,
			followerCount: res.data.data[0].followerCount,
		});
	} catch (err) {
		console.error(err.message);
	}
};

const getPopularSearches = async () => {
	try {
		const eyalgolan = await getAccount('eyalgolan1');
		const static = await getAccount('static_official');
		const noakirel = await getAccount('noakirel_');
		const galgadot = await getAccount('gal_gadot');

		return ([
			static,
			galgadot,
			noakirel,
			eyalgolan,
		]);

	} catch (err) {
		console.error(err.message);
	}
}

module.exports = { searchAccounts, getAccount, getPopularSearches };