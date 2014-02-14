/*
	Provides a single method that triggers a full installation.
 */


var prompt = require('prompt'),
	logger = require('../StatusLogger'),
	runner = require('../runner'),
	program = require('commander');


module.exports = function() {

	var operations = 0;

	runner.verify();
	operations = runner.countPendingInstalls();

	if (operations > 0) {

		if (program.force) {
			runner.install();
			if (program.install) {
				logger.printInfo('Did your install go well? If so, your next steps are...\n' +
					'\t' + program._name + ' --set-http-port 80\n' +
					'\t' + program._name + ' --set-http-host http://mandrill.example.com\n' +
					'\t' + program._name + ' --start\n');
			}
		}
		else {
			console.log(Array(80).join('.').yellow);
			prompt.get({
				name: 'install',
				description: ('Fix ' + operations + ' problem' + 
					(operations === 1 ? '' : 's') + '? [y/n]').bold.yellow,
				pattern: /^[yYnN]$/,
				required: true,
				default: 'n',
				message: 'Please answer "y" or "n"'
			}, function(err, result) {
				if (result.install === 'y' || result.install === 'Y') {
					runner.install();
					if (program.install) {
						logger.printInfo('Did your install go well? If so, your next steps are...\n' +
							'\t' + program._name + ' --set-http-port 80\n' +
							'\t' + program._name + ' --set-http-host http://mandrill.example.com\n' +
							'\t' + program._name + ' --start\n');
					}
				}
				else {
					logger.printInfo('No actions performed.');
				}
			});
		}
	}
	else {
		console.log('\n');
		
		console.log('Nothing to install, update, or repair!'.bold.green);
	}
}