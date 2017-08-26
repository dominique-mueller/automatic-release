import * as fs from 'fs';
import * as path from 'path';

import * as githubReleaser from 'conventional-github-releaser';
import * as githubRemoveAllReleases from 'github-remove-all-releases';

import { changelogTransformer } from './../templates/changelog-transform';
import { log } from './../log';
import { readChangelogTemplateFiles } from './changelog';

/**
 * Create all GitHub releases
 *
 * @param   repositoryOwner - Repository owner
 * @param   repositoyName   - Repository name
 * @param   repositoryUrl   - Repository URL
 * @param   githubToken     - GitHub token
 * @returns                 - Promise
 */
export function createAllGithubReleases( repositoryOwner: string, repositoyName: string, repositoryUrl: string, githubToken: string ):
	Promise<void> {
	return new Promise<void>( async( resolve: () => void, reject: ( error: Error ) => void ) => {

		try {

			log( 'substep', 'Delete all existing GitHub releases' );
			await deleteAllGithubReleases( repositoryOwner, repositoyName, githubToken );

			log( 'substep', 'Create all GitHub releases' );
			const changelogTemplates: { [ key: string ]: string } = await readChangelogTemplateFiles();
			await createGithubReleases( changelogTemplates, repositoryUrl, githubToken );

			resolve();

		} catch ( error ) {
			reject( error );
			return;
		}

	} );
}

/**
 * Create all GitHub releases
 *
 * @param   changelogTemplates - Changelog templates
 * @param   repositoryUrl      - Repository URL
 * @param   githubToken        - GitHub token
 * @returns                    - Promise
 */
function createGithubReleases( changelogTemplates: { [ key: string ]: string }, repositoryUrl: string, githubToken: string ): Promise<void> {
	return new Promise<void>( async( resolve: () => void, reject: ( error: Error ) => void ) => {

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
			transform: changelogTransformer( repositoryUrl ), // Custom transform (shows all commit types)
			mainTemplate: changelogTemplates.mainTemplate,
			commitPartial: changelogTemplates.commitTemplate,
			headerPartial: '', // No header for release notes
			footerTemplate: changelogTemplates.footerTemplate
		}, ( error: Error | null, response: any ) => { // We do not care about the response

			// Catch library errors
			if ( error ) {
				reject( new Error( `An error occured while creating GitHub releases. [${ error.message }]` ) );
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
				reject( new Error( `An error occured while deleting GitHub releases. [${ error.message }]` ) );
				return;
			}

			resolve();

		} );

	} );
}
