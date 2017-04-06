'use strict';

const fs = require( 'fs' );
const path = require( 'path' );

/**
 * Default export:
 * Read the package.json file, and parse its content.
 */
module.exports = function() {
	return new Promise( ( resolve, reject ) => {

		// Read package.json asynchronously
		fs.readFile( path.resolve( process.cwd(), 'package.json' ), 'utf8', ( error, data ) => {

			// Catch errors
			if ( error ) {
				reject( 'Error while reading the "package.json" file.' );
			}

			// Parse JSON data
			let parsedData;
			try {
				parsedData = JSON.parse( data );
			} catch( error ) {
				reject( 'Error while parsing the "package.json" file content.' );
			}

			// Continue
			resolve( parsedData );

		} );

	} );
}
