const db = require('./db');

const INFO = 'INFO';
const ERROR = 'ERROR';
const DEBUG = 'DEBUG';
const FATAL = 'FATAL';

const messageText = (message) => {
	if (message.message) {
		return message.message;
	} else {
		return message;
	}
};

const log = (message, info, type) => {
	db.log(messageText(message), info, type);
};

const info = async (message, info) => {
	log(message, info, INFO);
};

const debug = async (message, info) => {
	log(message, info, DEBUG);
};

const error = async (message, info) => {
	log(message, info, ERROR);
};

const fatal = async (message, info) => {
	log(message, info, FATAL);
};

module.exports = {
	info,
	debug,
	error,
	fatal
};
