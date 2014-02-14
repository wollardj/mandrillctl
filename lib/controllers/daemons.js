/*
	Responsible for startin, stopping, and getting information from the server
	daemons.
 */


var logger = require('../StatusLogger');
	daemons = {
		mongo: require('../mongo/mongo'),
		mandrill: require('../mandrill/mandrill')
	};




exports.daemonsArray = function() {
	return [
		daemons.mongo,
		daemons.mandrill
	];
};



exports.stop = function() {
	daemons.mandrill.stop();
	daemons.mongo.stop();
};




exports.start = function() {
	daemons.mongo.start();
	daemons.mandrill.start();
};




exports.status = function(printHeader) {
	if (printHeader === true) {
		logger.printSectionHeader('Daemon Status');
	}
	daemons.mongo.printStatus();
	daemons.mandrill.printStatus();
};




exports.restart = function() {
	exports.stop();
	exports.start();
};