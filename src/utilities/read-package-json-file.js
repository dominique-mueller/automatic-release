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
				throw new Error( {
					message: 'Error while reading the "package.json" file.',
					details: error
				} );
			}

			// Parse JSON data
			let parsedData;
			try {
				parsedData = JSON.parse( data );
			} catch( error ) {
				throw new Error( {
					message: 'Error while parsing the "package.json" file content.',
					details: error
				} );
			}

			// Continue
			resolve( parsedData );

		} );

	} );
}
