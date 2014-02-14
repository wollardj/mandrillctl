/*
	Deals with system user accounts and groups.
 */

var shell = require('shelljs'),
	colors = require('colors'),
	dscl = '/usr/bin/dscl . ',
	groups = require('./groups'),
	dseditgroup = '/usr/sbin/dseditgroup ';

shell.config.silent = true;


/*
	Returns a boolean value indicating aUser exists or not.
 */
exports.userExists = function(aUser) {
	var out;
	out = shell.exec(dscl + 'list /Users/' + aUser);
	return out.code === 0;
}




/*
	Returns the UniqueID for the specified user.
 */
exports.userId = function(aUser) {
	return parseInt(
		shell.exec(
			dscl + 'read /Users/' + aUser + ' PrimaryGroupID')
			.output
			.replace(/^[^0-9]*:/, ''
		),
	10);
}




/*
	Creates a new system-level user named aUser.
	Also adds the user to primaryGroup, but will fail if that group doesn't
	already exist.
 */
exports.createUser = function(aUser, description, primaryGroup) {
	// Obtain the highest uid in use by system accounts (<=500)
	// and add 1 to it.
	var createCmd = dscl + 'create /Users/' + aUser + ' ',
		uid = parseInt(shell.exec(
				dscl + 'list /Users PrimaryGroupID | grep -e \'^_\' | ' +
					'sed \'s/^_[^0-9]*//\' | sort -n | tail -n 1'
			).output, 10) + 1;

	if (uid === 1) {
		console.log("Couldn't detect a valid available uid for '" + aUser +
			"'".red);
		process.exit(1);
	}

	shell.exec(createCmd + 'UniqueID ' + uid);
	shell.exec(createCmd + 'UserShell /usr/bin/false');
	shell.exec(createCmd + 'RealName "' + description + '"');
	shell.exec(createCmd + 'home /var/empty');
	shell.exec(createCmd + 'passwd \\\*');
	shell.exec(createCmd + 'PrimaryGroupID ' + groups.groupId(primaryGroup));
	shell.exec(dseditgroup + '-o edit -a ' + aUser + ' -t user ' +
		primaryGroup);
	
	// Clean up some attributes that are automatically added by OS X.
	shell.exec(dscl + 'delete /Users/' + aUser + ' PasswordPolicyOptions');
	shell.exec(dscl + 'delete /Users/' + aUser + ' AuthenticationAuthority');
	shell.exec(dscl + 'delete /Users/' + aUser + ' ShadowHashData');
	shell.exec(dscl + 'delete /Users/' + aUser + ' KerberosKeys');
}




exports.removeUser = function(aUser) {
	shell.exec(dscl + 'delete /Users/' + aUser);
}