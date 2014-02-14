/*
	Downloads a file and outputs the download progress.
 */

var shell = require('shelljs'),
	logger = require('./StatusLogger'),
	deep = require('deep-diff');




/*
	Downloads a file at `url` to `dest` using cURL. Returns boolean `true` if
	the download was successful. Returns an object containing the `code` and
	`output` of the failed download.
 */
exports.download = function(url, dest) {
	var cachedSilent = shell.config.silent,
		output;

	logger.printInfo('\nDownloading ' + url);
	logger.printInfo('   -> ' + dest);

	// Turn on 'echo'
	shell.config.silent = false;

	output = shell.exec('/usr/bin/curl -L ' +
		exports.escapeShellArg(url) +
		' -o ' + exports.escapeShellArg(dest) +
		' --progress-bar');

	// Revert 'echo' setting
	shell.config.silent = cachedSilent;
	console.log();

	if (output.code !== 0) {
		return output;
	}
	return true;
};




exports.downloadRemoteJson = function(url) {
	var output = shell.exec('/usr/bin/curl --silent -L ' +
		exports.escapeShellArg(url));
	if (output.code === 0) {
		return JSON.parse(output.output);
	}
	else {
		throw new Error('Failed to download ' + url);
	}
};




exports.escapeShellArg = function(arg) {
	return '"' + arg.replace(/[^\\]"/g, '\"') + '"';
};




exports.unpackTgz = function(tarball, destPath) {
	var results;

	// make sure the target directory exists and is empty
	if (shell.test('-e', destPath) === true) {
		shell.rm('-rf', destPath);
	}
	shell.mkdir('-p', destPath);


	logger.describeAction('Extracting ' +
		tarball.split('/').reverse()[0] +
		' to ' + destPath);

	results = exports.tar(
		'-xzf', tarball, '-C', destPath, '--strip-components', '1');
	if (results !== true) {
		logger.closeAction(false);
		logger.printError(results.output, results.code);
	}
	else {
		logger.closeAction(true);
	}
	return results;
}



exports.tar = function() {

	var shelloutput,
		escOpts = [];

	for(var i = 0; i < arguments.length; i++) {
		escOpts.push( exports.escapeShellArg(arguments[i]) );
	}
	if (escOpts.length === 0) {
		throw new Error('utils.tar() expects arguments!');
	}

	// Always add the `--strip-components 1` option to make tar skip the
	// top-level directory when writing output paths.
	shelloutput = shell.exec('/usr/bin/tar ' + escOpts.join(' '));

	if (shelloutput.code !== 0) {
		return shelloutput;
	}

	return true;
};




/*
	Uses lsof to determine what, if any, process is listening to a given port.
	If nothing is listening on the given port, `false` is returned. If
	something is listening on that port, an object is returned which contains
	the fields `bin`, `pid`, and `owner`.
	- `bin` is the name of the binary using the port
	- `pid` is the process id of the process using the port
	- `owner` is the process's owner's username
 */
exports.processListeningOnPort = function(aPort) {
	var result = shell.exec('/usr/sbin/lsof -i:' + 
			exports.escapeShellArg(aPort + '') + ' | /usr/bin/grep LISTEN'),
		resArray;;

	if (result.code === 0 && result.output.length !== 0) {
		resArray = result.output.replace(/ +(?= )/g,'').split(' ');
		return {
			'bin': resArray[0],
			'pid': parseInt(resArray[1], 10),
			'owner': resArray[2]
		};
	}
	return false;
}