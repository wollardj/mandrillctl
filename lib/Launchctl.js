/*
	Provides a basic interface for launchctl.
 */

var shell = require('shelljs'),
	fs = require('fs'),
	deep = require('deep-diff'),
	utils = require('./utils'),
	cliapp = '/bin/launchctl ';



function pathForIdentifier(identifier, shellEscaped) {
	if (shellEscaped) {
		return utils.escapeShellArg('/Library/LaunchDaemons/' +
			identifier + '.plist');
	}
	return '/Library/LaunchDaemons/' + identifier + '.plist';
}




exports.pathForIdentifier = pathForIdentifier;



/*
	Writes `obj` in plist format using its `label` attribute to construct
	the file path.
 */
exports.object2Daemon = function(obj) {
	var label = obj && obj.Label ? obj.Label : false;

	if (!label) {
		throw new Error('Cannot convert object to daeomn unless it has a ' +
			'`label`. ' + JSON.stringify(obj));
	}

	JSON.stringify(obj).to( pathForIdentifier(label) );
	shell.exec('/usr/bin/plutil -convert xml1 ' + 
		pathForIdentifier(label, true) );

	fs.chownSync( pathForIdentifier(label), 0, 0);
	fs.chmodSync( pathForIdentifier(label), '644');
};




/*
	Loads / starts a daemon using its plist path.
*/
exports.load = function(identifier) {
	return shell.exec(cliapp + 'load ' +
		pathForIdentifier(identifier, true));
};




/*
	Unloads / stops a daemon using its plist path
 */
exports.unload = function(identifier) {
	return shell.exec(cliapp + 'unload ' +
		pathForIdentifier(identifier, true) );
};




/*
	Returns the output of `launchctl list <identifier>` as a Javascript
	object.
 */
exports.list = function(identifier) {
	var result = shell.exec(
			cliapp + 'list -x ' + utils.escapeShellArg(identifier) + ' | ' +
			'/usr/bin/plutil -convert json -o - -');
	if (result.code === 0) {
		return JSON.parse(result.output);
	}
	return false;
};



/*
	Returns `false` if the daemon identified by `label` isn't running,
	or the PID of the daemon if it is running.
 */
exports.pid = function(identifier) {
	var result = exports.list(identifier);
	if (result && result.PID) {
		return result.PID;
	}
	return false;
};




/*
	Returns the launchct.plist for the given identifier.
 */
exports.plist = function(identifier) {
	var result;

	result = shell.exec('/usr/bin/plutil -convert json -o - ' +
		pathForIdentifier(identifier, true) );

	if (result.code === 0) {
		return JSON.parse(result.output);
	}
	return false;
};



/*
	Uses plutil to convert a plist to json, loads that json object into memory
	as a parsed object, then compares that with `obj` to determine if they
	are different. Returns `true` if they match, `false` if not.
 */
exports.daemonMatchesObject = function(identifier, obj) {
	var plObject = exports.plist(identifier);

	if (plObject !== false) {

		// diff returns `undefined` when there are no differences between
		// the objects
		return deep.diff(plObject, obj) === undefined;
	}

	return false;
};