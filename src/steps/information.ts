import * as conventionalRecommendedBump from 'conventional-recommended-bump';
import * as git from 'simple-git';
import * as GitHubApi from 'github';
import * as parseGithubUrl from 'parse-github-url';
import * as semver from 'semver';

import { AutomaticReleaseInformation } from './../interfaces/automatic-release-information.interface';
import { GithubUrl } from './../interfaces/github-url.interface';
import { GitRemote } from './../interfaces/git-remote.interface';
import { GitTags } from './../interfaces/git-tags.interface';
import { PackageJson } from './../interfaces/package-json.interface';
import { readFile } from './../utilities/read-file';
import { RecommendedBump } from './../interfaces/recommended-bump.interface';
import { writeFile } from './../utilities/write-file';

/**
 * Collect all information needed for the automatic release process; also validates and even corrects them (if possible).
 *
 * @returns - Promise, resolves with information
 */
export function collectInformation(): Promise<AutomaticReleaseInformation> {
	return new Promise( async( resolve: ( information: AutomaticReleaseInformation ) => void, reject: ( error: Error ) => void ) => {

		// Read, correct and write the package.json file
		const packageJson: PackageJson = await readFile( 'package.json' );

		const information: AutomaticReleaseInformation = {};

		// Get version information
		information.oldVersion = packageJson.version;
		information.newVersion = await getNewVersion( information.oldVersion );

		// Get repository information
		const details: GithubUrl = parseGithubUrl( packageJson.repository.url );
		information.repositoryOwner = details.owner;
		information.repositoryName = details.name;
		information.repositoryUrl = details.href;

		// Get GitHub authorization details
		information.githubToken = await getGithubToken( information.repositoryOwner, information.repositoryName );

		resolve( information );

	} );
}

/**
 * Evaluate the new version, based on the old version and the commits happening since then
 *
 * @param   oldVersion - Old version
 * @returns            - Promise, resolves with new version
 */
function getNewVersion( oldVersion: string ): Promise<string> {
	return new Promise<any>( ( resolve: ( newVersion: string ) => void, reject: ( error: Error ) => void ) => {

		// Evaluate version bump
		conventionalRecommendedBump( {
			preset: 'angular'
		}, ( error: Error | null, recommendedBump: RecommendedBump ) => {

			// Handle errors
			if ( error ) {
				reject( error );
				return;
			}

			const newVersion: string = semver.inc( oldVersion, recommendedBump.releaseType );
			resolve( newVersion );

		} );

	} );
}

/**
 * Get and verify the GitHub token
 *
 * @param   repositoryOwner - Repository owner
 * @param   repositoryName  - Repository name
 * @returns                 - Promise, resolves with the GitHub token
 */
function getGithubToken( repositoryOwner: string, repositoryName: string ): Promise<string> {
	return new Promise<string>( ( resolve: ( githubToken: string ) => void, reject: ( error: Error ) => void ) => {

		// Get GitHub token from environment variable
		if ( !process.env.hasOwnProperty( 'GH_TOKEN' ) ) {
			reject( new Error( 'The "GH_TOKEN" environment variable is not set.' ) );
			return;
		}
		const githubToken: string = process.env.GH_TOKEN;
		resolve( githubToken );

	} );
}
