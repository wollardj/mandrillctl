/*
	A simple helper that runs a given function, which is expected to return
	a boolean value. A message gets sent to the console along with color and
	a symbol to indicate whether or not the check passed.
 */

var colors = require('colors'),
	logger = require('./StatusLogger'),
	mongoRunner = require('./mongo/mongo'),
	mandrillRunner = require('./mandrill/mandrill'),
	INSTALL_RUNTYPE = 0,
	VERIFY_RUNTYPE = 1,
	UNINSTALL_RUNTYPE = 2;




function validateRunnerObj(runner) {

	if (!runner ||
		!runner.runners ||
		!runner.description ||
		!runner.verify ||
		!runner.install ||
		!runner.uninstall
	) {
		throw new Error('runner expects runner objects to look like so\n' +
			'{\n' +
			'	runners: [],\n' +
			'	description: \'some description here\',\n' +
			'	verify: function() {},\n' +
			'	install: function() {},\n' +
			'	uninstall: function() {}\n' +
			'}\n' +
			(
				runner && runner.description ?
				'\nOffending runner was: ' + runner.description :
				'Object was: ' + JSON.stringify(runner)
			) +
			'\n\n'
			);
	}
}


function runJobs(runners, runType, nestLevel, parentRunner) {
	if (! runners.pop) {
		runners = [runners];
	}
	for(var i = 0; i < runners.length; i++) {
		runJob(runners[i], runType, nestLevel || 0, parentRunner);
	}
}




function runJob(runner, runType, nestLevel, parentRunner) {
	var prefix;

	validateRunnerObj(runner);

	if (!parentRunner) {
		if (runType === INSTALL_RUNTYPE && (!runner.queue || runner.queue.length === 0)) {
			// just don't print the header since we won't really be
			// doing anything.
		}
		else {
			logger.printSectionHeader( runner.description );
		}
		runJobs(runner.runners, runType, 0, runner);
		return;
	}

	prefix = Array(nestLevel + 1).join(' ');

	switch(runType) {
		case INSTALL_RUNTYPE:
			if (runner.installed === false) {
				logger.describeAction( prefix + 'Installing ' + runner.description );
				runner.install();
				runner.installed = runner.verify();
				logger.closeAction( runner.installed );
			}

			if (runner.runners.length > 0) {
				logger.closeActionMuted();
				runJobs(runner.runners, INSTALL_RUNTYPE, nestLevel, parentRunner);
			}
			break;

		case VERIFY_RUNTYPE:
			logger.describeAction( prefix + 'Verifying ' + runner.description );
			runner.installed = runner.verify();
			logger.closeAction( runner.installed );

			if (runner.runners.length > 0) {
				runJobs(runner.runners, VERIFY_RUNTYPE, nestLevel, runner);
			}

			break;

		case UNINSTALL_RUNTYPE:
			
			logger.describeAction( prefix + 'Uninstalling ' + runner.description );
			runner.uninstall();
			runner.installed = runner.verify();
			logger.closeAction( runner.installed === false );

			if (runner.runners.length > 0) {
				runJobs(runner.runners, UNINSTALL_RUNTYPE, nestLevel, parentRunner);
			}

			break;

		default:
			throw new Error('runner.runJob() unknown runtype ' + runType);
	}
}




module.exports = {
	runners: [
		mongoRunner,
		mandrillRunner
	],



	verify: function() {
		return runJobs(module.exports.runners, VERIFY_RUNTYPE);
	},


	install: function() {
		return runJobs(module.exports.runners, INSTALL_RUNTYPE);
	},


	uninstall: function() {
		return runJobs(module.exports.runners, UNINSTALL_RUNTYPE);
	},



	countPendingInstalls: function(runners) {
		num = 0;
		runners = runners || module.exports.runners;
		for(var i = 0; i < runners.length; i++) {
			if (runners[i].installed === false) {
				num++;
			}
			if (runners[i].runners.length > 0) {
				num += module.exports.countPendingInstalls(runners[i].runners);
			}
		}
		return num;
	}
};