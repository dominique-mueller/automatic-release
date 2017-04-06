'use strict';

const fs = require( 'fs' );
const path = require( 'path' );

/**
 * Default export:
 * Write the given content into the package.json file.
 */
module.exports = function( packageJsonFileContent ) {
	return new Promise( ( resolve, reject ) => {

		// Prepare data
		const preparedPackageJsonFileContent = `${ JSON.stringify( packageJsonFileContent, null, '	' ) }\n`;

		// Write content to the package.json file
		fs.writeFile( path.resolve( process.cwd(), 'package.json' ), preparedPackageJsonFileContent, ( error ) => {

			// Catch errors
			if ( error ) {
				throw new Error( {
					message: 'Error while writing to the "package.json" file.',
					details: error
				} );
			}

			// Done
			resolve();

		} );

	} );
}
