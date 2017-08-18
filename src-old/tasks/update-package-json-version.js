'use strict';

const chalk = require( 'chalk' );
const figures = require( 'figures' );

const readPackageJsonFile = require( './../utilities/read-package-json-file' );
const verifyPackageJsonFile = require( './../utilities/verify-package-json-file' );
const writePackageJsonFile = require( './../utilities/write-package-json-file' );

/**
 * Default export:
 * Update the version within the package.json file.
 */
module.exports = async function( newVersion ) {

	console.log( '' );
	console.log( chalk.white( '  Update "package.json" file' ) );

	// Read the package.json file, update the version, and write it back to disk
	const packageJsonFileContent = await readPackageJsonFile();
	packageJsonFileContent.version = newVersion;
	await writePackageJsonFile( packageJsonFileContent );

	console.log( chalk.green( `    ${ figures.tick } Bumped version number in the "package.json" file.` ) );

}
