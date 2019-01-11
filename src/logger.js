const db = require('./db');

const INFO = 'INFO';
const ERROR = 'ERROR';
const DEBUG = 'DEBUG';

const info = async (message, info) => {
	db.log(message, info, INFO);
	console.log(INFO, info, message);
}

const debug = async (message, info) => {
	db.log(message, info, DEBUG);
	console.log(DEBUG, info, message);
}

const error = async (message, info) => {
	db.log(message, info, ERROR);
	console.log(ERROR, info, message);
}

module.exports = {
	info,
	debug,
	error
};
