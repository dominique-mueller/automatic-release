import * as fs from 'fs';
import * as path from 'path';

import { PackageJson } from './../interfaces/package-json.interface';
import { readFile } from './../utilities/read-file';
import { writeFile } from './../utilities/write-file';

/**
 * Update package json file
 *
 * @param   newVersion - New version
 * @returns            - Promise
 */
export function updatePackageJson( newVersion: string ): Promise<void> {
	return new Promise<void>( async( resolve: () => void, reject: ( error: Error ) => void ) => {

		try {

			const packageJson: PackageJson = await readFile( 'package.json' );
			packageJson.version = newVersion;
			await writeFile( 'package.json', packageJson );

			resolve();

		} catch ( error ) {
			reject( error );
			return;
		}

	} );
}
