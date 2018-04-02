module.exports = (decoded, request, callback) => {
	console.log(111111)
    if(!decoded.id) {
        callback(null, false);
    } else {
        callback(null, true);
    }
};
