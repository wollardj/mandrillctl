var odUsers = require('../opendirectory/users'),
	config = require('../controllers/config').getConfig().mongo;


module.exports = {
	description: 'daemon user "' + config.daemonUser + '"',
	runners: [],




	verify: function() {
		return odUsers.userExists( config.daemonUser );
	},




	install: function() {
		odUsers.createUser(
			config.daemonUser,
			'MongoDB Server',
			config.daemonGroup
		);
	},




	uninstall: function() {
		odUsers.removeUser( config.daemonUser );
	}
};