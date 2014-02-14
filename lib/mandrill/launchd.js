var shell = require('shelljs'),
	launchctl = require('../Launchctl'),
	config = require('../controllers/config'),
	mandrillConf = function() {
		return config.getConfig().mandrill;
	},
	plistContents = function() {
		return {
			KeepAlive: true,
			Label: mandrillConf().identifier,
			EnvironmentVariables: {
				MONGO_URL: mandrillConf().server.mongoUrl,
				PORT: mandrillConf().server.port + '', // make sure it's a string or it won't bind
				ROOT_URL: mandrillConf().server.rootUrl,
				MANDRILL_MODE: 'production' // tells Mandirll to attemp a process uid change
			},
			ProgramArguments: [
				"/usr/local/bin/node",
				mandrillConf().server.installPath + '/main.js'
			],
			GroupName: mandrillConf().daemonGroup,
			RunAtLoad: true,
			SoftResourceLimits: {
				NumberOfFiles: 1024
			},
			StandardErrorPath: '/var/log/' + mandrillConf().identifier + '.err.log',
			StandardOutPath: '/var/log/' + mandrillConf().identifier + '.log'
		};
	};


module.exports = {
	description: launchctl.pathForIdentifier(mandrillConf().identifier),
	runners: [],

	verify: function() {
		return launchctl.daemonMatchesObject(
			mandrillConf().identifier, plistContents()
		) === true;
	},

	install: function() {
		launchctl.object2Daemon( plistContents() );
	},

	uninstall: function() {
		launchctl.unload( mandrillConf().identifier );
		shell.rm( launchctl.pathForIdentifier( mandrillConf().identifier ) );
	},
};