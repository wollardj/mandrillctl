var colors = require('colors'),
	launchctl = require('./Launchctl');



exports.printAppLogo = function() {
	var logo = [
		' _  _ ____ __ _ ___  ____ _ _    _   ',
		' |\\/| |--| | \\| |__> |--< | |___ |___',
		' ––––––––––––––––––––––––––––––––––––',
		'v0.6.3\n',
	];

	console.log("\n\n\n");
	for(var i = 0; i < logo.length; i++) {
		for(var j = logo[i].length; j < 79; j++) {
			if (j % 2 === 0) {
				logo[i] = logo[i] + ' ';
			}
			else {
				logo[i] = ' ' + logo[i];
			}
		}

		if (i < logo.length - 1) {
			console.log(logo[i].bold);
		}
		else {
			console.log(logo[i].grey);
		}
	}
};



exports.printSectionHeader = function(aHeader) {
	aHeader = '[ ' + aHeader + ' ]';
	var len = aHeader.length;
	while(aHeader.length < 79) {
		if (aHeader.length % 2 === 0) {
			aHeader = ' ' + aHeader;
		}
		else {
			aHeader = aHeader + ' '
		}
	}
	console.log();
	console.log(aHeader.inverse);
};




exports.describeAction = function(someAction) {
	someAction += ' ';
	while(someAction.length < 73) {
		someAction += '.';
	}
	someAction += ' ';
	process.stdout.write( someAction.grey );
};




exports.closeAction = function(passFail) {
	if (passFail !== true && passFail !== false) {
		process.stdout.write( '[ ? ]'.bold.yellow  + '\n');
	}
	else {
		process.stdout.write( (passFail === true ? '[ ✓ ]'.bold.green : '[ ✗ ]'.bold.red) + '\n');
	}
};




exports.closeActionMuted = function() {
	process.stdout.write('.....\n'.grey);
};




exports.printError = function(message, code) {
	if (!message) {
		throw new Error('exports.printError() requires a mesage!');
	}
	if (code) {
		message = '[ ✗ Error ' + code + ' ] - ' + message;
	}
	else {
		message = '[ ✗ ] - ' + message;
	}

	console.log(message.bold.red);
};




exports.printInfo = function(message) {
	console.log(message.magenta);
};




exports.printLaunchdPid = function(prettyName, label) {
	var pid;

	exports.describeAction(prettyName);
	pid = launchctl.pid(label);
	if (pid === false) {
		exports.closeAction(false);
	}
	else if (pid !== undefined) {
		pid = 'Process ID: ' + pid;
		exports.closeAction(true);
		while(pid.length < 79) {
			pid = ' ' + pid;
		}
		process.stdout.write(pid + '\n');
	}
	else {
		exports.closeAction();
	}
};
