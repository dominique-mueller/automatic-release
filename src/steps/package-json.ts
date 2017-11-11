import * as fs from 'fs';
import * as path from 'path';

import { log } from './../log';
import { PackageJson } from './../interfaces/package-json.interface';
import { readFile } from './../utilities/read-file';
import { writeFile } from './../utilities/write-file';

/**
 * Update package json file
 *
 * @param   newVersion - New version
 * @returns            - Promise
 */
export async function updatePackageJson( newVersion: string ): Promise<void> {

	log( 'substep', 'Read the "package.json" file' );
	// const packageJson: PackageJson = await readFile( 'package.json' );

	log( 'substep', 'Update the version number' );
	// packageJson.version = newVersion;

	log( 'substep', 'Write the "package.json" file' );
	// await writeFile( 'package.json', packageJson );

}
