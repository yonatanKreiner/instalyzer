const util = require('util');
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://instalyzer:GwJjV0N78llr@ds147390.mlab.com:47390/instalyzer';

const insert = async (collection, documents) => {
	try {
		const client = await MongoClient.connect(url, { useNewUrlParser: true });        
		await client.db('whatsappsync').collection(collection).insertOne(documents);
	} catch (err) {
		console.error(err.message);
	}
};

const log = async (message, err = undefined) => {
	const entry = {
		message,
		timestamp: new Date()
	};

	if (err) {
		await insert('logs', Object.assign({}, entry, {error: util.inspect(err)}));
	} else {
		await insert('logs', entry);
	}
};

module.exports = log;
