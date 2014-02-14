var shell = require('shelljs'),
	utils = require('../utils'),
	fs = require('fs'),
	config = require('../controllers/config').getConfig().mongo,
	dataPath = 'Unable to read dbpath from configs';


for(var i = 0; i < config.configContent.length; i++) {
	if (/^dbpath/.test(config.configContent[i])) {
		dataPath = config.configContent[i].split('=')[1].trim();
	}
}




module.exports = {
	description: dataPath,
	runners: [],




	verify: function() {
		return shell.test('-d', dataPath);
	},




	install: function() {
		shell.mkdir('-p', dataPath);
		shell.exec('/usr/sbin/chown -r ' + config.daemonUser +
			':' + config.daemonGroup + ' ' +
			utils.escapeShellArg(dataPath) );
	},




	uninstall: function() {
		shell.rm('-rf', dataPath);
	}
};