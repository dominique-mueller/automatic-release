'use strict';

const fs = require( 'fs' );
const path = require( 'path' );

const chalk = require( 'chalk' );
const conventionalGithubReleaser = require( 'conventional-github-releaser' );
const figures = require( 'figures' );

const customTransformFunction = require( './../templates/changelog-transform' );

/**
 * Default export:
 * Create a new release on GitHub, including release notes (aka changelog content).
 */
module.exports = async function() {
	return new Promise( ( resolve, reject ) => {

		console.log( '' );
		console.log( chalk.white( '  Publish release on GitHub' ) );

		// Get the GitHub API token from the environment variables (remove all empty spaces, just to be sure)
		const githubApiToken = process.env.GH_TOKEN.replace( /\s+/g, '' );

		// Create release on GitHub
		conventionalGithubReleaser( {
			type: 'oauth',
			token: githubApiToken // GITHUB TOKEN ENVIRONMENT VARIABLE
		}, {
			preset: 'angular'
		}, {}, {}, {}, {
			transform: customTransformFunction, // Custom transform (shows all commit types)
			mainTemplate: fs.readFileSync( path.resolve( __dirname, './../templates/changelog-main.hbs' ), 'utf-8' ),
			commitPartial: fs.readFileSync( path.resolve( __dirname, './../templates/changelog-commits.hbs' ), 'utf-8' ),
			headerPartial: '', // Empty header for release notes
			footerTemplate: fs.readFileSync( path.resolve( __dirname, './../templates/changelog-footer.hbs' ), 'utf-8' )
		}, ( error, responses ) => {

			// Catch library errors
			if ( error ) {
				reject( {
					message: 'An error occured while creating a new release in GitHub.',
					details: error
				} );
			}

			// Catch GitHub errors
			if ( responses.length > 0 && responses[ 0 ].state === 'rejected' ) {
				reject( {
					message: 'An error occured while creating a new release in GitHub.',
					details: `${ responses[ 0 ].state }: ${ responses[ 0 ].reason }`
				} );
			}

			console.log( chalk.green( `    ${ figures.tick } Created new release (w/ changelog in the notes) on GitHub.` ) );
			resolve();

		} );

	} );

};
