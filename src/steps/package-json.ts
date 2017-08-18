import * as fs from 'fs';
import * as path from 'path';

export function packageJson( fileContent: any ): Promise<void> {
	return writePackageJsonFile( fileContent );
}



function writePackageJsonFile( fileContent: any ): Promise<void> {
	return new Promise<void>( ( resolve: () => void, reject: ( error: Error ) => void ) => {

		const preparedFileContent: string = `${ JSON.stringify( fileContent, null, '	' ) }\n`;

		fs.writeFile( path.resolve( process.cwd(), 'package.json' ), preparedFileContent, 'utf-8', ( error: Error ) => {

			if ( error ) {
				reject( error ); // TODO: Handle error
				return;
			}

			resolve();

		} );

	} );
}
