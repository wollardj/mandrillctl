var odGroups = require('../opendirectory/groups'),
	config = require('../controllers/config').getConfig().mongo;


module.exports = {
	description: 'daemon group "' + config.daemonGroup + '"',
	runners: [],




	verify: function() {
		return odGroups.groupExists(config.daemonGroup);
	},




	install: function() {
		odGroups.createGroup(config.daemonGroup, 'MongoDB Server', config.daemonGroup);
	},




	uninstall: function() {
		odGroups.removeGroup(config.daemonGroup);
	}
};