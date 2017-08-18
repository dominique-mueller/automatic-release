import * as fs from 'fs';
import * as path from 'path';

import * as conventionalChangelog from 'conventional-changelog';

import * as changelogTransform from './../templates/changelog-transform';

export function changelog( repositoryUrl: string ): Promise<void> {
	return new Promise<void>( async( resolve: () => void, reject: ( error: Error ) => void ) => {

		const changelog: string = await generateChangelog( repositoryUrl );
		await writeChangelogFile( changelog );

		resolve();

	} );
}



function writeChangelogFile( fileContent: string ): Promise<void> {
	return new Promise<void>( ( resolve: () => void, reject: ( error: Error ) => void ) => {

		fs.writeFile( path.resolve( process.cwd(), 'CHANGELOG.md' ), fileContent, 'utf-8', ( error: Error ) => { // Creates if necessary

			if ( error ) {
				reject( error ); // TODO: Handle error
				return;
			}

			resolve();

		} );

	} );
}

function generateChangelog( repositoryUrl: string ): Promise<string> {
	return new Promise<string>( ( resolve: ( changelogContent: string ) => void, reject: ( error: Error ) => void ) => {

		const changelogChunks: Array<string> = [];
		changelogChunks.push( `# Changelog\n\nAlso see the **[release page]( ${ repositoryUrl }/releases )**.\n\n` );

		const changelogStream: any = conventionalChangelog( { // package.json file has to be updated before
			preset: 'angular',
			releaseCount: 0 // Regenerate the whole thing every time
		}, {
			linkCompare: false // We use a custom link
		}, {}, {}, {
			transform: changelogTransform, // Custom transform (shows all commit types)
			mainTemplate: fs.readFileSync( path.resolve( __dirname, './../templates/changelog-main.hbs' ), 'utf-8' ), // TODO: async
			commitPartial: fs.readFileSync( path.resolve( __dirname, './../templates/changelog-commit.hbs' ), 'utf-8' ),
			headerPartial: fs.readFileSync( path.resolve( __dirname, './../templates/changelog-header.hbs' ), 'utf-8' ),
			footerTemplate: fs.readFileSync( path.resolve( __dirname, './../templates/changelog-footer.hbs' ), 'utf-8' )
		} );

		changelogStream.on( 'error', ( error: Error ) => {
			reject( error ); // TODO: Handle error
			return;
		} );

		changelogStream.on( 'data', ( dataChunk: string ) => {
			changelogChunks.push( dataChunk );
		} );

		changelogStream.on( 'end', () => {
			changelogChunks.push( '<br>\n\n---\n\n<sup>*Changelog generated automatically by [automatic-release](https://github.com/dominique-mueller/automatic-release).*</sup>\n' );
			const changelog: string = changelogChunks.join( '' );
			resolve( changelog );
		} );

	} );
}
