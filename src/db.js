const util = require('util');
const MongoClient = require('mongodb').MongoClient;

const url = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}`;

const connect = async () => (MongoClient.connect(url, { useNewUrlParser: true }));

const insert = async (collection, documents) => {
	try {
		const client = await connect();
		await client.db(process.env.DB_NAME).collection(collection).insertOne(documents);
		client.close();
	} catch (err) {
		console.error(err.message);
	}
};

const findById = async (collection, id) => {
	try {
		const client = await connect();
		const res = await client.db(process.env.DB_NAME).collection(collection).findOne({ id: id });
		client.close();
		return res;
	} catch (err) {
		console.error(err.message);
	}
};

const upsertMail = async (mail) => {
	try {
		const client = await connect();
		await client.db(process.env.DB_NAME).collection('mails').replaceOne({ mail }, { mail }, { upsert: true });
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
		info.errorMessage = util.inspect(info.errorMessage);
	}
	
	if (info) {
		await insert('logs', { ...entry, info });
	} else {
		await insert('logs', entry);
	}
};

module.exports = { log, upsertMail, insert, findById };
