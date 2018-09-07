import * as path from 'path';
import * as stream from 'stream';

import * as conventionalChangelog from 'conventional-changelog';

import { changelogTransformer, changelogCommitGroupsSort } from './../templates/changelog-transform';
import { log } from './../log';
import { readFile } from './../utilities/read-file';
import { writeFile } from './../utilities/write-file';

export class ChangelogGenerator {

	/**
	 * Generate and write the changelog
	 * Important: The package.json file has to be updated before this runs, otherwhise the new version will be ignored!
	 *
	 * @param   repositoryUrl - Repository URL
	 * @returns               - Promise
	 */
	public async generateAndWriteChangelog( repositoryUrl: string ): Promise<void> {

		log( 'substep', 'Generage changelog' );
		const changelog: string = await this.generateChangelogContent( repositoryUrl );

		log( 'substep', 'Write the "CHANGELOG.md" file' );
		await writeFile( 'CHANGELOG.md', changelog );

	}

	/**
	 * Generate the changelog
	 *
	 * @param   repositoryUrl      - Repository URL
	 * @returns                    - Promise, resolves with changelog
	 */
	private async generateChangelogContent( repositoryUrl: string ): Promise<string> {
		return new Promise<string>( async ( resolve: ( changelogContent: string ) => void, reject: ( error: Error ) => void ) => {

			// Read in changelog template files
			const changelogChunks: Array<string> = [];

			// Header information
			changelogChunks.push( '# Changelog\n\n' ); // Title
			changelogChunks.push( `Also see the **[release page](${ repositoryUrl }/releases)**.\n` ); // Sub-title (Github-specific)

			// Generate changelog
			const changelogStream: stream.Readable = conventionalChangelog( { // package.json file has to be updated before
				pkg: {
					path: path.resolve( process.cwd(), 'package.json' )
				},
				preset: 'angular',
				releaseCount: 0 // Regenerate the whole thing every time
			}, {
					linkCompare: false // We use a custom link
				}, {}, {}, {
					commitGroupsSort: changelogCommitGroupsSort,
					commitPartial: await this.readTemplate( 'commit' ),
					footerPartial: await this.readTemplate( 'footer' ),
					headerPartial: await this.readTemplate( 'header' ),
					mainTemplate: await this.readTemplate( 'main' ),
					transform: changelogTransformer( repositoryUrl ) // Custom transform (shows all commit types)
				} );

			// Handle errors
			changelogStream.on( 'error', ( error: Error ) => {
				reject( new Error( `An error occured while generating the changelog. [${ error.message }]` ) );
				return;
			} );

			// Handle incoming data
			changelogStream.on( 'data', ( dataChunk: string ) => {
				changelogChunks.push( dataChunk );
			} );

			// Handle finish
			changelogStream.on( 'end', () => {

				// Footer information
				changelogChunks.push( '\n<br>\n\n---\n\n<sup>*Changelog generated automatically by [automatic-release](https://github.com/dominique-mueller/automatic-release).*</sup>\n' );

				// Create the full changelog
				const changelog: string = changelogChunks.join( '' );
				resolve( changelog );

			} );

		} );
	}

	private async readTemplate( templateName: string ): Promise<string> {
		return readFile( `./../templates/changelog-${ templateName }.hbs`, true );
	}

}
