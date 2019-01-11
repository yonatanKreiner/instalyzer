exports.isEmailAddressValid = (email) => /\S+@\S+\.\S+/.test(email);
exports.isStringNullOrEmpty = (str) => (!str || str === '');
