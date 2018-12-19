const axios = require('axios');

const searchAccounts = async (account) => {
	const res = await axios.get('https://hypeauditor.com/suggest/?search=' + account, { headers: { 'x-requested-with': 'XMLHttpRequest' } });
	return res.data;
};

const getAccount = async (account) => {
	let accountStatistics = axios.post('https://fetcher.igaudit.io/users', { usernames: [account] });
	let accountSearch = searchAccounts(account);
	const accountData = await Promise.all([accountStatistics, accountSearch]);

	accountStatistics = accountData[0].data.data[0];
	accountSearch = accountData[1];

	if (accountSearch) {
		const filteredAccount = accountSearch.filter((accountItem) => (accountItem.username === account))[0];

		if (filteredAccount) {
			return ({
				username: filteredAccount.username,
				full_name: filteredAccount.full_name,
				avatar_url: filteredAccount.avatar_url,
				mediaPosts: accountStatistics.mediaPosts,
				followingCount: accountStatistics.followingCount,
				followerCount: accountStatistics.followerCount,
			});
		} else {
			return {};
		}
	}
};

const getPopularSearches = async () => {
	return await Promise.all([
		getAccount('eyalgolan1'),
		getAccount('static_official'),
		getAccount('noakirel_'),
		getAccount('gal_gadot')
	]);
};

module.exports = { searchAccounts, getAccount, getPopularSearches };