import * as path from 'path';

/**
 * Resolve path
 *
 * @param   filePath                - File path
 * @param   [isWithinLibrary=false] - Flag, describing whether the file lies within this library or within the project using this library
 * @returns                         - Resolved path
 */
export function resolvePath( filePath: string, isWithinLibrary: boolean = false ) {

	return isWithinLibrary
		? path.resolve( __dirname, filePath ) // Relative to library
		: path.resolve( process.cwd(), filePath ); // Absolute path, based on the path of the project using this library

}
