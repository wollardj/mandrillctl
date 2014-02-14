/*
	A name space for the other controllers.
 */

var logger = require('../StatusLogger'),
	colors = require('colors');


exports.daemons = require('./daemons');
exports.uninstall = require('./uninstall');
exports.install = require('./install');
exports.config = require('./config');
exports.printLogo = logger.printAppLogo;


exports.requireRoot = function() {
	if (process.getuid() !== 0) {
		console.log('This option requires root privileges.'.red);
		process.exit(1);
	}
}
