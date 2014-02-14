#!/usr/local/bin/node

var program = require('commander'),
	app = require('./lib/controllers/controller'),
	logger = require('./lib/StatusLogger');


program
	.option('-i, --install', 'Alias for --update')
	.option('-u, --update',  'Installs or updates Mandrill and its\n' +
'                               requirements.\n' +
'                               NOTE: If you need to use a proxy server, set \n' +
'                               the http_proxy environment variable prior to\n' +
'                               running this command.\n' +
'                               `export http_proxy=http://proxy.server:port/`')
	.option('-f, --force',	'Use with -u or -i to bypass prompts')
	.option('-s, --status', 'Displays the status of the Mandrill and MongoDB\n'+
'                               server processes.')
	.option('--stop',       'Halts the MongoDB and Mandrill servers')
	.option('--start',      'Starts the MongoDB and Mandrill servers')
	.option('--restart',    'Restarts the MongoDB and Mandrill servers')
	.option('--no-logo',    'Don\'t include the Mandrill logo and version in\n'+
'                               the output')
	.option('--get-http-port', 'Displays the port on which Mandrill will listen')
	.option('--set-http-port <port>', 'Sets the port on which Mandrill will\n' +
'                               listen')
	.option('--get-http-host', 'Displays the host/fqdn for the Mandrill server.')
	.option('--set-http-host <http://fqdn>', 'Sets the host/fqdn for the\n' +
'                               Mandrill server')
	.option('--uninstall',	'Uninstalls Mandrill, MongoDB + databases.\n' + 
'                               mandrillctl will not uninstall itself.');




program.parse(process.argv);

// `logo` will be true unless `--no-logo` is given
if (program.logo === true) {
	app.printLogo();
}




if (program.status) {
	app.daemons.status(true);
}

else if (program.stop) {
	app.requireRoot();
	app.daemons.stop();
	app.daemons.status(true);
}
else if(program.start) {
	app.requireRoot();
	app.daemons.start();
	app.daemons.status(true);
}
else if (program.restart) {
	app.requireRoot();
	app.daemons.restart();
	app.daemons.status(true);
}


else if (program.getHttpPort) {
	if (program.logo) {
		logger.printInfo('Mandrill\'s configured port is: ' +
			app.config.getHttpPort());
	}
	else {
		console.log(app.config.getHttpPort());
	}
}
else if (program.setHttpPort) {
	app.requireRoot();
	logger.describeAction('Setting Mandrill\'s port to ' + program.setHttpPort);
	if (app.config.setHttpPort( program.setHttpPort ) === true) {
		logger.closeAction(true);
	}
}
else if (program.getHttpHost) {
	if (program.logo) {
		logger.printInfo('Mandrill\'s configured host is: ' +
			app.config.getHttpHost());
	}
	else {
		console.log(app.config.getHttpHost());
	}
}
else if (program.setHttpHost) {
	app.requireRoot();
	logger.describeAction('Setting host to ' + program.setHttpHost);
	if (app.config.setHttpHost( program.setHttpHost ) === true) {
		logger.closeAction(true);
	}
	else {
		logger.closeAction(false);
	}
}


else if (program.uninstall) {
	app.requireRoot();
	app.uninstall();
}
else if (program.update || program.install) {
	app.requireRoot();
	app.install();
}


else {
	program.help();
}