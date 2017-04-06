'use strict';

const fs = require( 'fs' );
const path = require( 'path' );

const chalk = require( 'chalk' );
const concatStream = require( 'concat-stream' );
const conventionalChangelog = require( 'conventional-changelog' );
const figures = require( 'figures' );

const customTransformFunction = require( './../templates/changelog-transform' );

/**
 * Default export:
 * Generate the whole changelog, and save it as CHANGELOG.md file.
 */
module.exports = function( repositoryUrl ) {
	return new Promise( ( resolve, reject ) => {

		console.log( '' );
		console.log( chalk.white( '  Generate changelog' ) );

		// Create writable stream
		const changelogFileStream = fs.createWriteStream( 'CHANGELOG.md' );

		// Catch errors
		changelogFileStream.on( 'error', ( error ) => {
			throw new Error( {
				message: 'An error occured while generating the changelog.',
				details: error
			} );
		} );

		// Wait for all data being written
		changelogFileStream.on( 'finish', () => {
			console.log( chalk.green( `    ${ figures.tick } Generated changelog, then placed it within the "CHANGELOG.md" file.` ) );
			resolve();
		} );

		// Generate changelog (as a data stream)
		conventionalChangelog( {
				preset: 'angular',
				releaseCount: 0 // Regenerate the whole thing every time
			}, {
				linkCompare: false // We use a custom link
			}, {}, {}, {
				transform: customTransformFunction, // Custom transform (shows all commit types)
				mainTemplate: fs.readFileSync( path.resolve( __dirname, './../templates/changelog-main.hbs' ), 'utf-8' ),
				commitPartial: fs.readFileSync( path.resolve( __dirname, './../templates/changelog-commits.hbs' ), 'utf-8' ),
				headerPartial: fs.readFileSync( path.resolve( __dirname, './../templates/changelog-header.hbs' ), 'utf-8' ),
				footerTemplate: fs.readFileSync( path.resolve( __dirname, './../templates/changelog-footer.hbs' ), 'utf-8' )
			} )
			.pipe( concatStream( {
				encoding: 'buffer'
			}, ( data ) => {

				// Wait for the changelog stream to be done, then prepend and append additional information
				changelogFileStream.write( `# Changelog\n\nAlso see the [release page]( ${ repositoryUrl }/releases ).\n\n` );
				changelogFileStream.write( data );
				changelogFileStream.write( '<br>\n\n---\n\n<br>\n\n*Changelog generated automatically.*\n' );
				changelogFileStream.end();

			} ) );

	} );
}
