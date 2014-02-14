/*
	Provides a single method that triggers a full uninstallation.
 */



var runner = require('../runner'),
	logger = require('../StatusLogger'),
	prompt = require('prompt');


module.exports = function() {

	console.log(Array(80).join('.').grey);
	prompt.get({

		name: 'uninstall',
		description: ('Really remove Mandrill, MongoDB server and databases? [y/n]').bold.red,
		pattern: /^[yYnN]$/,
		required: true,
		default: 'n',
		message: 'Please answer "y" or "n"'

	}, function(err, result) {

		if (result.uninstall === 'y' || result.uninstall === 'Y') {
			runner.uninstall();
		}
		else {
			logger.printInfo('No actions performed.');
		}

	});
}
