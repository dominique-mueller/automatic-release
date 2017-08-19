import * as fs from 'fs';
import * as path from 'path';

import * as githubReleaser from 'conventional-github-releaser';
import * as githubRemoveAllReleases from 'github-remove-all-releases';

import { readChangelogTemplateFiles } from './changelog';
import * as changelogTransform from './../templates/changelog-transform';

/**
 * Create all GitHub releases
 *
 * @param   owner       - Repository owner
 * @param   name        - Repository name
 * @param   githubToken - GitHub token
 * @returns             - Promise
 */
export function createAllGithubReleases( owner: string, name: string, githubToken: string ): Promise<void> {
	return new Promise<void>( async( resolve: () => void, reject: ( error: Error ) => void ) => {

		await deleteAllGithubReleases( owner, name, githubToken );
		await createGithubReleases( githubToken );

		resolve();

	} );
}

/**
 * Create all GitHub releases
 *
 * @param   githubToken - GitHub token
 * @returns             - Promise
 */
function createGithubReleases( githubToken: string ): Promise<void> {
	return new Promise<void>( async( resolve: () => void, reject: ( error: Error ) => void ) => {

		// Read in changelog template files
		const changelogTemplates: { [ key: string ]: string } = await readChangelogTemplateFiles();

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
			mainTemplate: changelogTemplates.mainTemplate,
			commitPartial: changelogTemplates.commitTemplate,
			headerPartial: '', // No header for release notes
			footerTemplate: changelogTemplates.footerTemplate
		}, ( error: Error | null, response: any ) => { // We do not care about the response

			// Catch library errors
			if ( error ) {
				reject( error );
				return;
			}

			resolve();

		} );

	} );

}

/**
 * Delete all GitHub releases
 *
 * @param   owner       - Repository owner
 * @param   name        - Repository name
 * @param   githubToken - GitHub token
 * @returns             - Promise
 */
function deleteAllGithubReleases( owner: string, name: string, githubToken: string ): Promise<void> {
	return new Promise<void>( ( resolve: () => void, reject: ( error: Error ) => void ) => {

		// Clean all releases on GitHub
		githubRemoveAllReleases( {
			type: 'oauth',
			token: githubToken
		}, owner, name, ( error: Error | null, response: any ) => { // We do not care about the response

			// Catch library errors (except missing releases)
			if ( error && error.toString() !== 'Error: No releases found' ) {
				reject( error );
				return;
			}

			resolve();

		} );

	} );
}
