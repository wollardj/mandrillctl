var shell = require('shelljs'),
	launchctl = require('../Launchctl'),
	config = require('../controllers/config').getConfig().mongo,
	plistContents = {
		HardResourceLimits: {
			NumberOfFiles: 1024,
			NumberOfProcesses: 512
		},
		KeepAlive: false,
		Label: config.identifier,
		ProgramArguments: [
			"/usr/local/bin/mongod",
			"run",
			"--config",
			config.configPath
		],
		RunAtLoad: true,
		SoftResourceLimits: {
			NumberOfFiles: 1024,
			NumberOfProcesses: 512
		},
		StandardErrorPath: '/var/log/' + config.identifier + '.err.log',
		StandardOutPath: '/var/log/' + config.identifier + '.log'
	};


module.exports = {
	description: launchctl.pathForIdentifier(
		config.identifier
	),
	runners: [],

	verify: function() {
		return launchctl.daemonMatchesObject(
			config.identifier, plistContents
		);
	},

	install: function() {
		launchctl.object2Daemon( plistContents );
	},

	uninstall: function() {
		launchctl.unload( config.identifier );
		shell.rm(
			launchctl.pathForIdentifier(
				config.identifier
			)
		);
	},
};