/*
	Deals with system user accounts and groups.
 */

var shell = require('shelljs'),
	colors = require('colors'),
	dscl = '/usr/bin/dscl . ',
	dseditgroup = '/usr/sbin/dseditgroup ';

shell.config.silent = true;


/*
	Returns a boolen value indicating the specified group exists or not.
 */
exports.groupExists = function(aGroup) {
	var out;
	out = shell.exec(dscl + 'list /Groups/' + aGroup);
	return out.code === 0;
};



/*
	Returns the PrimaryGroupID for the specified group.
 */
exports.groupId = function(aGroup) {
	return parseInt(shell.exec(dscl + 'read /Groups/' + aGroup + ' PrimaryGroupID').output
		.replace(/^[^0-9]*:/, ''), 10);
}




/*
	Creates a new group with aGroupName and description.
	The group's id is calculated by collecting and sorting all existing groups
	and adding one to the highest number found.
 */
exports.createGroup = function(aGroup, description) {
	var gid = parseInt(shell.exec(
				dscl + 'list /Groups PrimaryGroupID | grep -e \'^_\' | ' +
					'sed \'s/^_[^0-9]*//\' | sort -n | tail -n 1'
			).output, 10) + 1;
	shell.exec(dseditgroup + ' -o create -n . ' + aGroup);
	shell.exec(dscl + 'create /Groups/' + aGroup + ' PrimaryGroupID ' + gid);
	shell.exec(dscl + 'create /Groups/' + aGroup + ' RealName "' + description + '"');
	shell.exec(dscl + 'create /Groups/' + aGroup + ' passwd \\\*');
}




exports.removeGroup = function(aGroup) {
	shell.exec(dscl + 'delete /Groups/' + aGroup);
}