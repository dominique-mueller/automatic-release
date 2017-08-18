'use strict';

const semver = require( 'semver' );

/**
 * Default export:
 * Verify that the package.json file contains all the necessary information we require to proceed in a successful manner. If some field is
 * either missing or invalid, an error will be thrown. Consequently, this function simply passes is everything seems to be fine.
 */
module.exports = function( packageJsonContent ) {

	// Check the 'name' field
	if ( !packageJsonContent.hasOwnProperty( 'name' ) ) {
		throw new Error( 'The "package.json" file has no "name" field.' );
	}

	// Check the 'version' field
	if ( !packageJsonContent.hasOwnProperty( 'version' ) ) {
		throw new Error( 'The "package.json" file has no "version" field.' );
	} else {
		if ( semver.valid( packageJsonContent.version ) === null ) {
			throw new Error( 'The "package.json" file has an invalid "version" field.' );
		}
	}

	// Check the 'repository' field
	if ( !packageJsonContent.hasOwnProperty( 'repository' ) ) {
		throw new Error( 'The "package.json" file has no "repository" field.' );
	} else {
		if ( !packageJsonContent.repository.hasOwnProperty( 'url' ) ) {
			throw new Error(  'The "package.json" file has no "repository.url" field.' );
		}
	}

}
