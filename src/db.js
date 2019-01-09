const util = require('util');
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://instalyzer:GwJjV0N78llr@ds147390.mlab.com:47390/instalyzer';

const connect = async () => (MongoClient.connect(url, { useNewUrlParser: true }));

const insert = async (collection, documents) => {
	try {
		const client = await connect();
		await client.db('instalyzer').collection(collection).insertOne(documents);
		client.close();
	} catch (err) {
		console.error(err.message);
	}
};

const findById = async (collection, id) => {
	try {
		const client = await connect();
		const res = await client.db('instalyzer').collection(collection).findOne({id: id});
		return res;
	} catch (err) {
		console.error(err.message);
	}
};

const upsertMail = async (mail) => {
	try {
		const client = await connect();       
		await client.db('instalyzer').collection('mails').replaceOne({mail}, {mail}, {upsert: true});
		client.close();
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

module.exports = { log, upsertMail, insert, findById };
