'use strict';

const fs = require( 'fs' );
const path = require( 'path' );

const chalk = require( 'chalk' );
const conventionalGithubReleaser = require( 'conventional-github-releaser' );
const githubRemoveAllReleases = require( 'github-remove-all-releases' );
const figures = require( 'figures' );

const customTransformFunction = require( './../templates/changelog-transform' );

/**
 * Default export:
 * Create a new release on GitHub, including release notes (aka changelog content).
 */
module.exports = async function( repositoryUrl ) {
	return new Promise( ( resolve, reject ) => {

		console.log( '' );
		console.log( chalk.white( '  Publish release on GitHub' ) );

		// Get the GitHub API token from the environment variables (remove all empty spaces, just to be sure)
		const githubApiToken = process.env.GH_TOKEN.replace( /\s+/g, '' );
		const repositoryOwner = repositoryUrl.split( '/' )[ 3 ];
		const repositoryName = repositoryUrl.split( '/' )[ 4 ];

		// Clean all releases on GitHub
		githubRemoveAllReleases( {
			type: 'oauth',
			token: githubApiToken // GITHUB TOKEN ENVIRONMENT VARIABLE
		}, repositoryOwner, repositoryName, ( error, response ) => {

			// Catch library errors (except missing releases)
			if ( error && error.toString() !== 'Error: No releases found' ) {
				reject( 'An error occured while cleaning all releases on GitHub.' );
			}

			// Catch GitHub errors
			if ( response.length > 0 && response[ 0 ].state === 'rejected' ) {
				reject( `An error occured while cleaning all releases on GitHub. ${ response[ 0 ].state }: ${ response[ 0 ].reason }` );
			}

			// Create a new release on GitHub
			conventionalGithubReleaser( {
				type: 'oauth',
				token: githubApiToken // GITHUB TOKEN ENVIRONMENT VARIABLE
			}, {
				preset: 'angular',
				releaseCount: 0 // Regenerate the whole thing every time
			}, {
				linkCompare: false // We use a custom link
			}, {}, {}, {
				transform: customTransformFunction, // Custom transform (shows all commit types)
				mainTemplate: fs.readFileSync( path.resolve( __dirname, './../templates/changelog-main.hbs' ), 'utf-8' ),
				commitPartial: fs.readFileSync( path.resolve( __dirname, './../templates/changelog-commit.hbs' ), 'utf-8' ),
				headerPartial: '', // Empty header for release notes
				footerTemplate: fs.readFileSync( path.resolve( __dirname, './../templates/changelog-footer.hbs' ), 'utf-8' )
			}, ( error, response ) => {

				// Catch library errors
				if ( error ) {
					reject( 'An error occured while creating a new release on GitHub.' );
				}

				// Catch GitHub errors
				if ( response.length > 0 && response[ 0 ].state === 'rejected' ) {
					reject( `An error occured while creating a new release on GitHub. ${ response[ 0 ].state }: ${ response[ 0 ].reason }` );
				}

				console.log( chalk.green( `    ${ figures.tick } Created new release (w/ changelog in the notes) on GitHub.` ) );
				resolve();

			} );

		} );

	} );

};
