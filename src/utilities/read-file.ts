import * as fs from 'fs';
import * as path from 'path';

/**
 * Read a file
 *
 * @param   filePath                - Path to the file
 * @param   [isWithinLibrary=false] - Flag, describing whether the file lies within this library or within the project using this library
 * @returns                         - Promise, resolves with File content (parsed if JSON)
 */
export function readFile( filePath: string, isWithinLibrary: boolean = false ): Promise<string | any> {
	return new Promise<string | any>( ( resolve: ( fileContent: string | any ) => void, reject: ( error: Error ) => void ) => {

		// Resolve file path to an absolute one
		const resolvedFilePath: string = isWithinLibrary
			? path.resolve( __dirname, filePath )
			: path.resolve( process.cwd(), filePath );

		// Read file asynchronously
		fs.readFile( resolvedFilePath, 'utf-8', ( readFileError: Error | null, fileContent: string ) => {

			// Handle errors
			if ( readFileError ) {
				reject( readFileError );
				return;
			}

			// Automatically parse JSON files into JavaScript objects
			let parsedFileContent: string | any = fileContent;
			if ( path.extname( resolvedFilePath ).replace( '.', '' ).toLowerCase() === 'json' ) {

				// Safely try to parse the file as JSON
				try {
					parsedFileContent = JSON.parse( fileContent );
				} catch ( jsonParseError ) {
					reject( jsonParseError );
					return;
				}

			}

			resolve( parsedFileContent );

		} );

	} );
}
