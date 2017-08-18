'use strict';

const path = require( 'path' );

const chalk = require( 'chalk' );
const figures = require( 'figures' );
const githubUrlFromGit = require( 'github-url-from-git' );

const checkFileAccess = require( './../utilities/check-file-access' );
const readPackageJsonFile = require( './../utilities/read-package-json-file' );
const verifyPackageJsonFile = require( './../utilities/verify-package-json-file' );

/**
 * Default export:
 * Prepare for the release process, by checking for all required file, and extracting basic information from them.
 */
module.exports = async function() {

	console.log( '' );
	console.log( chalk.white( '  Check prerequisites' ) );

	// First, check that all necessary files exist, and that we have the necessary access rights.
	await checkFileAccess( 'CHANGELOG.md' );
	console.log( chalk.green( `    ${ figures.tick } The "CHANELOG.md" file exists, and can be read / modified.` ) );
	await checkFileAccess( 'package.json' );
	console.log( chalk.green( `    ${ figures.tick } The "package.json" file exists, and can be read / modified.` ) );

	// Then, read and verify the package.json file
	const packageJsonFileContent = await readPackageJsonFile();
	verifyPackageJsonFile( packageJsonFileContent );
	console.log( chalk.green( `    ${ figures.tick } The "package.json" file contains all required fields.` ) );

	// Finally, check for environment variables
	if ( process.env.GH_TOKEN === undefined ) {
		throw new Error( 'The "GH_TOKEN" environment variable cannot be found.' );
	}
	console.log( chalk.green( `    ${ figures.tick } The "GH_TOKEN" environment variable exists.` ) );

	// Return results
	return {
		name: packageJsonFileContent.name,
		oldVersion: packageJsonFileContent.version,
		repositoryUrl: githubUrlFromGit( packageJsonFileContent.repository.url )
	};

}
