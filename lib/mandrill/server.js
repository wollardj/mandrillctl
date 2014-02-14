var shell = require('shelljs'),
	utils = require('../utils'),
	logger = require('../StatusLogger'),
	config = require('../controllers/config').getConfig().mandrill,
	versionFile = config.server.installPath + '/.version.json',
	installedInfo,
	latestInfo;


function fetchLatestInfo() {
	if (!latestInfo) {
		latestInfo = utils.downloadRemoteJson(config.latestJsonUrl);
	}

	if (shell.test('-f', versionFile) === true) {
		installedInfo = JSON.parse(shell.cat(versionFile));
	}
	else {
		installedInfo = {'stable': {'version':'0.0.0'}};
	}
};



module.exports = {
	description: "Mandrill Server",
	runners: [],




	/*
		- needs to look for available updates and make sure the app is not only
		installed, but at the current version.
	 */
	verify: function() {
		var latestVersion,
			installedVersion;
		
		fetchLatestInfo();
		latestVersion = latestInfo.stable.version;
		installedVersion = installedInfo.stable.version;

		// Update the description of this runner so it is a little more obvious
		// to the user which version is being installed.
		if (installedVersion !== latestVersion) {
			module.exports.description = module.exports.description +
				' (v' + latestVersion + ')';
		}

		return latestVersion === installedVersion &&
			shell.test('-f', config.server.installPath + '/main.js');
	},




	/*
		Download and install the latest version available.
	 */
	install: function() {
		fetchLatestInfo();
		var tmpDir = shell.tempdir(),
			tmpDir = (tmpDir === '.' ? '/private/tmp/mandrillctl' : tmpDir) + '/',
			archive = tmpDir + latestInfo.stable.url.split('/').reverse()[0],
			unpackedDir = tmpDir + 'mandrill/';

		shell.mkdir('-p', unpackedDir);

		if (utils.download(latestInfo.stable.url, archive) === true) {
			utils.unpackTgz(archive, config.server.installPath);
			shell.rm('-f', archive);

			// write the latest installed version file to the install path
			// so it can be used to identify which version was just installed.
			JSON.stringify(latestInfo).to(versionFile);
		}
	},




	uninstall: function() {
		shell.rm('-rf', config.server.installPath);
	}
};