const util = require('util');
const MongoClient = require('mongodb').MongoClient;
const url = process.env.MONGO_CONNECTION_URL;

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
		const res = await client.db('instalyzer').collection(collection).findOne({ id: id });
		return res;
	} catch (err) {
		console.error(err.message);
	}
};

const upsertMail = async (mail) => {
	try {
		const client = await connect();
		await client.db('instalyzer').collection('mails').replaceOne({ mail }, { mail }, { upsert: true });
		client.close();
	} catch (err) {
		console.error(err.message);
	}
};

const log = async (message, info, type = 'UNKNOWN') => {
	const entry = {
		message,
		timestamp: new Date(),
		type: type,
	};

	if (info && info.errorMessage) {
		info.errorMessage = util.inspect(info.errorMessage)
	}

	if (info) {
		await insert('logs', { ...entry, info });
	} else {
		await insert('logs', entry);
	}
};

const isProd = process.env.NODE_ENV === 'production';
const nop = () => { };

module.exports = isProd
	? { log, upsertMail, insert, findById }
	: { log: nop, upsertMail: nop, insert: nop, findById: nop };
