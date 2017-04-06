'use strict';

const chalk = require( 'chalk' );
const conventionalRecommendedBump = require( 'conventional-recommended-bump' );
const figures = require( 'figures' );
const semver = require( 'semver' );

/**
 * Default export:
 * Evaluate the next version to be published, based on the semantic versioning principle, achieved by analyzing previous commits.
 */
module.exports = function( oldVersion ) {
	return new Promise( ( resolve, reject ) => {

		console.log( '' );
		console.log( chalk.white( '  Evaluate version change' ) );

		// Get recommended version bump
		conventionalRecommendedBump( {
			preset: 'angular'
		}, ( error, data ) => {

			// Catch errors
			if ( error ) {
				throw new Error( {
					message: 'An error occured while evaluating the next version.',
					details: error
				} );
			}

			// Calculate new version
			const newVersion = semver.inc( oldVersion, data.releaseType );
			console.log( chalk.green( `    ${ figures.tick } Calculated version change from ${ oldVersion } to ${ newVersion } (${ data.releaseType } bump).` ) );

			// Continue
			resolve( newVersion );

		} );

	} );
}
