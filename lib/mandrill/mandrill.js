/*
	Top-level functionality for verifying and installing Mandrill.
 */

var user = require('./user'),
	group = require('./group'),
	server = require('./server'),
	logger = require('../StatusLogger'),
	launchctl = require('../Launchctl'),
	config = require('../controllers/config'),
	serverPlist = require('./launchd');


module.exports = {
	description: 'Mandrill',
	runners: [
		server,
		serverPlist,
		group,
		user
	],

	verify: function() {},
	install: function() {},
	uninstall: function() {},




	start: function() {
		launchctl.load( config.getConfig().mandrill.identifier );
	},




	stop: function() {
		launchctl.unload( config.getConfig().mandrill.identifier );
	},




	printStatus: function() {
		logger.printLaunchdPid('Mandrill Server', config.getConfig().mandrill.identifier);
	}
};