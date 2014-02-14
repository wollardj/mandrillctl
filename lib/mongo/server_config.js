var shell = require('shelljs'),
	utils = require('../utils'),
	logger = require('../StatusLogger'),
	config = require('../controllers/config').getConfig().mongo;


module.exports = {
	description: config.configPath,
	runners: [],




	verify: function() {
		var configExists = shell.test('-e', config.configPath),
			configMatches = false;
		
		if (configExists === true) {
			configMatches = config.configContent.join('\n') ===
				shell.cat( config.configPath );
		}
		
		return configExists && configMatches;
	},




	install: function() {
		// make sure the config directory exists.
		shell.mkdir('-p', config.configPath.replace(/\/[^\/]*$/, ''));
		config.configContent
			.join('\n')
			.to( config.configPath );
	},




	uninstall: function() {
		if (shell.test('-f', config.configPath)) {
			shell.rm('-f', config.configPath);
		}
	}
};