'use strict';

const chalk = require( 'chalk' );
const figures = require( 'figures' );

const prepare = require( './src/tasks/prepare' );
const evaluateNewVersion = require( './src/tasks/evaluate-new-version' );
const updatePackageJsonVersion = require( './src/tasks/update-package-json-version' );
const generateChangelogFile = require( './src/tasks/generate-changelog-file' );
const gitCommitTagPush = require( './src/tasks/git-commit-tag-push' );
const releaseGithub = require( './src/tasks/release-github' );

/**
 * Automatic release process.
 */
async function main() {

	// Header

	console.log( '' );
	console.log( chalk.white.underline( 'Automatic Release' ) );

	const startTime = new Date().getTime();
	let hasFinishedSuccessfully = true;

	// Main process

	try {

		// Get initial data in the preparing phase
		const preparedData = await prepare();
		const name = preparedData.name;
		const oldVersion = preparedData.oldVersion;
		const repositoryUrl = preparedData.repositoryUrl;

		// Evaluate the new version, and update the package.json file
		const newVersion = await evaluateNewVersion( oldVersion );
		await updatePackageJsonVersion( newVersion );

		// Generate changelog
		await generateChangelogFile( repositoryUrl );

		// Commit, tag, and push to master
		await gitCommitTagPush( newVersion );

		// Publish release on GitHub
		await releaseGithub();

	} catch( error ) {
		hasFinishedSuccessfully = false;
		console.log( chalk.red( `    ${ figures.cross } ${ error }` ) );
		if ( error.hasOwnProperty( 'details' ) ) {
			console.log( chalk.red( `      ${ error.details }` ) );
		}
	}

	// Footer

	const finishTime = new Date().getTime();
	const processTime = ( ( finishTime - startTime ) / 1000 ).toFixed( 3 );

	console.log( '' );
	if ( hasFinishedSuccessfully ) {
		console.log( `Finished after ${ processTime } seconds.` );
	} else {
		console.log( chalk.red( `Did not finish, aborted due to errors.` ) );
	}
	console.log( '' );

	// Exit

	if ( hasFinishedSuccessfully ) {
		process.exit( 0 );
	} else {
		process.exit( 1 );
	}

};

// Run
main();
