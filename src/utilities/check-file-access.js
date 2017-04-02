'use strict';

const fs = require( 'fs' );
const path = require( 'path' );

/**
 * Default export:
 * Check if some file exists at the given path, and verify that its readable as well as writable to us.
 */
module.exports = function( pathToFile ) {
	return new Promise( ( resolve, reject ) => {

		// Asynchronously check if we do have access to the file at the given path
		fs.access( path.resolve( process.cwd(), pathToFile ), fs.constants.R_OK | fs.constants.W_OK, ( error ) => {

			// Catch errors
			if ( error ) {
				reject( {
					message: `File at the path "${ pathToFile }" does not exist, or cannot be read / written.`
				} );
			}

			// Continue
			resolve();

		} );

	} );
}
