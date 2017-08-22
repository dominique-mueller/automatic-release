import * as fs from 'fs';
import * as path from 'path';

import { resolvePath } from './resolve-path';

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
		const resolvedFilePath: string = resolvePath( filePath, isWithinLibrary );

		// Read file asynchronously
		fs.readFile( resolvedFilePath, 'utf-8', ( readFileError: NodeJS.ErrnoException | null, fileContent: string ) => {

			// Handle errors
			if ( readFileError ) {
				reject( new Error( `An error occured while reading the file "${ resolvedFilePath }". [Code "${ readFileError.code }", Number "${ readFileError.errno }"]` ) );
				return;
			}

			// Automatically parse JSON files into JavaScript objects
			let parsedFileContent: string | any = fileContent;
			if ( path.extname( resolvedFilePath ).replace( '.', '' ).toLowerCase() === 'json' ) {

				// Safely try to parse the file as JSON
				try {
					parsedFileContent = JSON.parse( fileContent );
				} catch ( jsonParseError ) {
					reject( new Error( `An error occured while parsing the file "${ resolvedFilePath }" as JSON. [${ ( <Error> jsonParseError ).message }]` ) );
					return;
				}

			}

			resolve( parsedFileContent );

		} );

	} );
}
