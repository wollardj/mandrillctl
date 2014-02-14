var shell = require('shelljs'),
	utils = require('../utils'),
	logger = require('../StatusLogger'),
	config = require('../controllers/config').getConfig().mongo,
	binaries = [
		'/usr/local/bin/bsondump',
		'/usr/local/bin/mongo',
		'/usr/local/bin/mongoexport',
		'/usr/local/bin/mongooplog',
		'/usr/local/bin/mongos',
		'/usr/local/bin/mongotop',
		'/usr/local/bin/mongod',
		'/usr/local/bin/mongofiles',
		'/usr/local/bin/mongoperf',
		'/usr/local/bin/mongosniff',
		'/usr/local/bin/mongodump',
		'/usr/local/bin/mongoimport',
		'/usr/local/bin/mongorestore',
		'/usr/local/bin/mongostat'
	];


module.exports = {
	description: "MongoDB binaries",
	runners: [],




	verify: function() {
		var installed = true;

		for(var i = 0; i < binaries.length && installed === true; i++) {
			installed = shell.test('-e', binaries[0]);
		}
		
		return installed;
	},




	install: function() {
		var tmpDir = shell.tempdir(),
			tmpDir = (tmpDir === '.' ? '/private/tmp/mandrillctl' : tmpDir) + '/',
			archive = tmpDir + config.installUrl.split('/').reverse()[0],
			unpackedDir = tmpDir + 'mongo/';


		if (utils.download(config.installUrl, archive) === true) {
			if (utils.unpackTgz(archive, unpackedDir) === true) {
					logger.describeAction('Installing mongo binaries to /usr/local/bin');
					shell.mv('-f', unpackedDir + '/bin/*', '/usr/local/bin/');
					if (shell.error()) {
						logger.closeAction(false);
						console.log( (shell.error()).red);
						shell.rm('-rf', unpackedDir);
						shell.rm('-f', archive);
						process.exit(1);
					}
					logger.closeAction(true);
					
					shell.rm('-rf', unpackedDir);
					shell.rm('-f', archive);
			}
		}
	},




	uninstall: function() {
		for(var i = 0; i < binaries.length; i++) {
			shell.rm('-f', binaries[i]);
		}
	}
};