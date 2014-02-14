/*
	Provides methods to set and retrieve configurations for this server.
 */


var config = require('../../config.json'),
	shell = require('shelljs'),
	utils = require('../utils'),
	launchctl = require('../Launchctl'),
	logger = require('../StatusLogger'),
	siteConfigPath = '/usr/local/etc/mandrill.config.json',
	pkgConfig = require('../../config.json');




/*
	Looks for a process using the given port other than mandrill and prints
	an error message if found. Returns `true` if an error was reported, `false`
	if the port appears to be unused.
 */
function printPortInUseIfNeeded(port) {

	var listener = utils.processListeningOnPort( port );

	// Print an error if Mandrill's configured port is being used by a process
	// other than mandrill
	if (listener && listener.owner !== config.mandrill.daemonUser) {
		logger.printError(
			'Process "' + listener.bin + '" (' + listener.pid + ') is ' +
			'using port ' + port + '!'
		);
		return true;
	}
	return false;
}



/*
	Returns the active config object for mandrillctl.
	If /usr/local/etc/mandrill.config.json doesn't exist, it will be created
	by copying the config.json file provided in the mandrillctl package.
 */
exports.getConfig = function() {
	if (shell.test('-f', siteConfigPath) === false) {
		exports.writeConfig(pkgConfig);
	}

	return JSON.parse( shell.cat(siteConfigPath) );
};




/*
	Updates the config file using the provided object. Note: This is expected
	to be the entire config object, not a fragment of it. If a fragment is
	provided, it _will_ replace the contents of the existing config.
 */
exports.writeConfig = function(configObject) {
	var configDir = siteConfigPath.replace(/\/[^\/]*$/, '/');

	if (shell.test('-d', configDir) === false) {
		shell.mkdir('-p', configDir);
	}

	// writes the _formatted_ JSON string to the config file
	JSON.stringify(configObject, null, '\t').to( siteConfigPath );
};



exports.getHttpPort = function() {
	var config = exports.getConfig(),
		existingListener = utils.processListeningOnPort(
			config.mandrill.server.port );

	printPortInUseIfNeeded( config.mandrill.server.port );
	return config.mandrill.server.port;
};




exports.setHttpPort = function(port) {
	var config = exports.getConfig(),
		plist = launchctl.plist( config.mandrill.identifier );
		unavailable = printPortInUseIfNeeded(port);

	if (unavailable === true) {
		return false;
	}

	// Make sure we get the port updated in the ROOT_URL field as well	
	config.mandrill.server.rootUrl = config.mandrill.server.rootUrl.replace(/:[0-9]*$/, '');
	config.mandrill.server.rootUrl += ':' + port;

	config.mandrill.server.port = parseInt(port, 10);
	exports.writeConfig(config);

	plist.EnvironmentVariables.PORT = port + '';
	plist.EnvironmentVariables.ROOT_URL = config.mandrill.server.rootUrl;
	launchctl.object2Daemon( plist );
	return true;
};




exports.getHttpHost = function() {
	var config = exports.getConfig();

	return config.mandrill.server.rootUrl;
};




exports.setHttpHost = function(host) {
	var config = exports.getConfig(),
		plist = launchctl.plist( config.mandrill.identifier );

	if (/:[0-9]*$/.test(host) === false) {
		host += ":" + config.mandrill.server.port;
	}

	config.mandrill.server.rootUrl = host;
	exports.writeConfig(config);
	
	plist.EnvironmentVariables.ROOT_URL = host;
	launchctl.object2Daemon( plist );
	return true;
};
