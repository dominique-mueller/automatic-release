import * as fs from 'fs';
import * as path from 'path';

/**
 * Write content into a file
 *
 * @param   filePath                - Path to the file
 * @param   fileContent             - Content of the file
 * @param   [isWithinLibrary=false] - Flag, describing whether the file lies within this library or within the project using this library
 * @returns                         - Promise
 */
function writeFile( filePath: string, fileContent: string | Object, isWithinLibrary: boolean = false ): Promise<void> {
	return new Promise<void>( ( resolve: () => void, reject: ( error: Error ) => void ) => {

		// Resolve file path to an absolute one
		const resolvedFilePath: string = isWithinLibrary
			? path.resolve( __dirname, filePath )
			: path.resolve( process.cwd(), filePath );

		// Automatically stringify objects
		const preparedFileContent: string = ( typeof fileContent === 'string' )
			? fileContent
			: `${ JSON.stringify( fileContent, null, '	' ) }\n`; // Indentation using tabs, empty line at the end

		// Write file asynchronously
		fs.writeFile( resolvedFilePath, preparedFileContent, 'utf-8', ( error: Error ) => { // Implicitely creates the file if necessary

			// Handle errors
			if ( error ) {
				reject( error ); // TODO: Handle error
				return;
			}

			resolve();

		} );

	} );
}
