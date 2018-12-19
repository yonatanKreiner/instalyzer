const axios = require('axios');

const getFollowers = async (account) => {
	try {
		const user = (await axios.get('https://fetcher.igaudit.io/user/' + account)).data;
		const res = await axios.get('https://api.igaudit.io/sample_follower_usernames/' + user.userId,
			{ headers: { Origin: 'https://igaudit.io' } });
		return { userId: user.userId, followers: res.data.followers };
	} catch (err) {
		console.error(err.message);
	}
};

const splitFollowers = (followers) => {
	const chunks = [];
	const chunkSize = 20;
	const chunksNum = followers.length / chunkSize;

	for (let i = 0; i < chunksNum; i++) {
		const followersChunk = i * chunkSize;
		chunks[i] = followers.slice(followersChunk, followersChunk + chunkSize);
	}

	if (followers.length % chunkSize !== 0) {
		chunks[chunksNum + 1] = followers.slice(chunksNum * chunkSize, chunksNum);
	}

	return chunks;
};

const getFakeRate = async (user, followersArray) => {
	const res = await axios.post('https://fetcher.igaudit.io/statistics', {
		data: followersArray, username: user.account, userId: user.id
	});
	const rate = (100 - res.data.real_follower_percentage).toFixed(2);

	return rate;
};

const checkAccount = async (account) => {
	try {
		const user = await getFollowers(account);
		const chunks = splitFollowers(user.followers);

		const followersData = await Promise.all(chunks.map(async chunk => {
			return (await axios.post('https://fetcher.igaudit.io/users', { usernames: chunk })).data;
		}));

		const followersArray = [].concat(...followersData.map(res => res.data));

		return getFakeRate({ id: user.userId, account }, followersArray);
	} catch (err) {
		console.error(err.message);
	}
};

module.exports = checkAccount;