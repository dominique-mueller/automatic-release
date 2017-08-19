import * as stream from 'stream';

import * as conventionalChangelog from 'conventional-changelog';

import { readFile } from './../utilities/read-file';
import { writeFile } from './../utilities/write-file';
import { changelogTransformer } from './../templates/changelog-transform';

/**
 * Generate and write the changelog
 * Important: The package.json file has to be updated before this runs, otherwhise the new version will be ignored!
 *
 * @param   repositoryUrl - Repository URL
 * @returns               - Promise
 */
export function generateAndWriteChangelog( repositoryUrl: string ): Promise<void> {
	return new Promise<void>( async( resolve: () => void, reject: ( error: Error ) => void ) => {

		const changelog: string = await generateChangelog( repositoryUrl );
		await writeFile( 'CHANGELOG.md', changelog );

		resolve();

	} );
}

/**
 * Generate the changelog
 *
 * @param   repositoryUrl - Repository URL
 * @returns               - Promise, resolves with changelog
 */
function generateChangelog( repositoryUrl: string ): Promise<string> {
	return new Promise<string>( async( resolve: ( changelogContent: string ) => void, reject: ( error: Error ) => void ) => {

		// Read in changelog template files
		const changelogTemplates: { [ key: string ]: string } = await readChangelogTemplateFiles();

		const changelogChunks: Array<string> = [];

		// Header information
		changelogChunks.push( '# Changelog\n\n' ); // Title
		changelogChunks.push( `Also see the **[release page]( ${ repositoryUrl }/releases )**.\n\n` ); // Sub-title (Github-specific)

		// Generate changelog
		const changelogStream: stream.Readable = conventionalChangelog( { // package.json file has to be updated before
			preset: 'angular',
			releaseCount: 0 // Regenerate the whole thing every time
		}, {
			linkCompare: false // We use a custom link
		}, {}, {}, {
			transform: changelogTransformer( repositoryUrl ), // Custom transform (shows all commit types)
			mainTemplate: changelogTemplates.mainTemplate,
			commitPartial: changelogTemplates.commitTemplate,
			headerPartial: changelogTemplates.headerTemplate,
			footerTemplate: changelogTemplates.footerTemplate
		} );

		// Handle errors
		changelogStream.on( 'error', ( error: Error ) => {
			reject( error );
			return;
		} );

		// Handle incoming data
		changelogStream.on( 'data', ( dataChunk: string ) => {
			changelogChunks.push( dataChunk );
		} );

		// Handle finish
		changelogStream.on( 'end', () => {

			// Footer information
			changelogChunks.push( '<br>\n\n---\n\n<sup>*Changelog generated automatically by [automatic-release](https://github.com/dominique-mueller/automatic-release).*</sup>\n' );

			// Create the full changelog
			const changelog: string = changelogChunks.join( '' );
			resolve( changelog );

		} );

	} );
}

/**
 * Read changelog template files
 *
 * @returns - Promise, resolves with the template files' content
 */
export function readChangelogTemplateFiles(): Promise<{ [ key: string ]: string }> {
	return new Promise<{ [ key: string ]: string }>(
		async( resolve: ( templates: { [ key: string ]: string } ) => void, reject: ( error: Error ) => void ) => {

		// Read template files
		const [ mainTemplate, commitTemplate, headerTemplate, footerTemplate ] = await Promise.all( [
			readFile( './../templates/changelog-main.hbs', true ),
			readFile( './../templates/changelog-commit.hbs', true ),
			readFile( './../templates/changelog-header.hbs', true ),
			readFile( './../templates/changelog-footer.hbs', true )
		] );

		// Assign tempaltes
		const templates: { [ key: string ]: string } = {
			mainTemplate,
			commitTemplate,
			headerTemplate,
			footerTemplate
		};

		resolve( templates );

	} );
}
