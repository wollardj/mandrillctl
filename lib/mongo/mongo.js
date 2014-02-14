/*
	Top-level functionality for verifying and installing mongodb.
 */

var user = require('./user'),
	group = require('./group'),
	server = require('./server'),
	serverConfig = require('./server_config'),
	dataPath = require('./dataPath'),
	config = require('../controllers/config').getConfig().mongo,
	launchctl = require('../Launchctl'),
	logger = require('../StatusLogger'),
	serverPlist = require('./launchd');


module.exports = {
	description: 'MongoDB',
	runners: [
		server,
		serverConfig,
		dataPath,
		serverPlist,
		group,
		user
	],

	verify: function() {},
	install: function() {},
	uninstall: function() {},




	start: function() {
		launchctl.load( config.identifier );
	},




	stop: function() {
		launchctl.unload( config.identifier );
	},


	printStatus: function() {
		logger.printLaunchdPid('MongoDB Server', config.identifier );
	}
};