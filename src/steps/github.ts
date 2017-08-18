import * as fs from 'fs';
import * as path from 'path';

import * as githubReleaser from 'conventional-github-releaser';
import * as githubRemoveAllReleases from 'github-remove-all-releases';

import * as changelogTransform from './../templates/changelog-transform';

export function cleanAndCreateGithubReleases( owner: string, name: string, githubToken: string ): Promise<void> {
	return new Promise<void>( async( resolve: () => void, reject: ( error: Error ) => void ) => {

		await deleteAllGithubReleases( owner, name, githubToken );
		await createGithubReleases( githubToken );

		resolve();

	} );
}



function createGithubReleases( githubToken: string ): Promise<void> {
	return new Promise<void>( ( resolve: () => void, reject: ( error: Error ) => void ) => {

		// Create a new release on GitHub
		githubReleaser( {
			type: 'oauth',
			token: githubToken
		}, {
			preset: 'angular',
			releaseCount: 0 // Regenerate the whole thing every time
		}, {
			linkCompare: false // We use a custom link
		}, {}, {}, {
			transform: changelogTransform, // Custom transform (shows all commit types)
			mainTemplate: fs.readFileSync( path.resolve( __dirname, './../templates/changelog-main.hbs' ), 'utf-8' ), // TODO: Async
			commitPartial: fs.readFileSync( path.resolve( __dirname, './../templates/changelog-commit.hbs' ), 'utf-8' ),
			headerPartial: '', // Empty header for release notes
			footerTemplate: fs.readFileSync( path.resolve( __dirname, './../templates/changelog-footer.hbs' ), 'utf-8' )
		}, ( error, response ) => {

			// Catch library errors
			if ( error ) {
				reject( error ); // TODO: Handle error
				return;
			}

			resolve();

		} );

	} );

}

function deleteAllGithubReleases( owner: string, name: string, githubToken: string ): Promise<void> {
	return new Promise<void>( ( resolve: () => void, reject: ( error: Error ) => void ) => {

		// Clean all releases on GitHub
		githubRemoveAllReleases( {
			type: 'oauth',
			token: githubToken
		}, owner, name, ( error: Error, response: any ) => {

			// Catch library errors (except missing releases)
			if ( error && error.toString() !== 'Error: No releases found' ) {
				reject( error ); // TODO: Handle error
				return;
			}

			resolve();

		} );

	} );
}
