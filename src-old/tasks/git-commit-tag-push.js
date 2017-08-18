'use strict';

const path = require( 'path' );

const chalk = require( 'chalk' );
const figures = require( 'figures' );
const git = require( 'simple-git' );

/**
 * Default export:
 * Add, commit and push all changes to the remote git repository.
 */
module.exports = async function( newVersion ) {
	return new Promise( ( resolve, reject ) => {

		console.log( '' );
		console.log( chalk.white( '  Save changes to Git' ) );

		git()

			// Stage changed files, then commit
			.add( path.resolve( process.cwd(), 'package.json' ) )
			.add( path.resolve( process.cwd(), 'CHANGELOG.md' ) )
			.commit( `Release ${ newVersion } [skip ci]` )
			.then( () => {
				console.log( chalk.green( `    ${ figures.tick } Commited all changes (will skip CI).` ) );
			} )

			// Create a tag
			.addAnnotatedTag( newVersion, `Release of version ${ newVersion }.` )
			.then( () => {
				console.log( chalk.green( `    ${ figures.tick } Created a new Git version tag.` ) );
			} )

			// Push to origin/master
			.push( 'origin', 'master', {
				'--follow-tags': null // 'null' means enabled
			} )
			.then( () => {
				console.log( chalk.green( `    ${ figures.tick } Pushed both commit and tag to origin.` ) );
			} )

			// Update the develop branch (and return back to master)
			.checkout( 'develop' )
			.mergeFromTo( 'master', 'develop' )
			.push( 'origin', 'develop' )
			.checkout( 'master' )
			.then( () => {
				console.log( chalk.green( `    ${ figures.tick } Updated the develop branch with the changes.` ) );
			} )

			// Continue
			.then( () => {
				resolve();
			} );

	} );

};
