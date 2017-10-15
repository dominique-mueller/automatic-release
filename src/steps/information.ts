import * as conventionalRecommendedBump from 'conventional-recommended-bump';
import * as git from 'simple-git';
import * as GitHubApi from 'github';
import * as parseGithubUrl from 'parse-github-url';
import * as semver from 'semver';

import { AutomaticReleaseInformation } from './../interfaces/automatic-release-information.interface';
import { GithubUrl } from './../interfaces/github-url.interface';
import { GitTags } from './../interfaces/git-tags.interface';
import { log } from './../log';
import { PackageJson } from './../interfaces/package-json.interface';
import { readFile } from './../utilities/read-file';
import { RecommendedBump } from './../interfaces/recommended-bump.interface';
import { writeFile } from './../utilities/write-file';

/**
 * Collect all information needed for the automatic release process; also validates and even corrects them (if possible).
 *
 * @returns - Promise, resolves with information
 */
export async function collectInformation(): Promise<AutomaticReleaseInformation> {

	// Read, correct and write the package.json file
	log( 'substep', 'Read the "package.json" file' );
	const packageJson: PackageJson = await readFile( 'package.json' );
	log( 'substep', 'Validate the "package.json" file' );
	validateAndCorrectPackageJson( packageJson );

	const information: AutomaticReleaseInformation = {};

	// Get version information
	log( 'substep', 'Retrieve versioning details' );
	information.isFirstVersion = !( await hasGitTags() );
	information.oldVersion = packageJson.version;
	information.newVersion = information.isFirstVersion ? information.oldVersion : await getNewVersion( information.oldVersion );

	// Get repository information
	log( 'substep', 'Get repository information' );
	const githubUrl: GithubUrl = parseGithubUrl( packageJson.repository.url );
	information.repositoryOwner = githubUrl.owner;
	information.repositoryName = githubUrl.name;
	information.repositoryUrl = githubUrl.href;

	// Get GitHub authorization details
	log( 'substep', 'Read & validate GitHub API token' );
	information.githubToken = await getGithubToken( information.repositoryOwner, information.repositoryName );

	return information;

}

/**
 * Validate the package json content
 *
 * @param packageJson - Package json content
 */
function validateAndCorrectPackageJson( packageJson: PackageJson ): void {

	// Check the 'version' field
	if ( !packageJson.hasOwnProperty( 'version' ) ) {
		throw new Error( `The "package.json" file does not have a version defined.` );
	}
	if ( semver.valid( packageJson.version ) === null ) { // 'null' means invalid
		throw new Error( `The "package.json" file defines the version "${ packageJson.version }"; regarding semantic versioning this is not a valid version number.` );
	}
	if ( semver.prerelease( packageJson.version ) !== null ) { // 'null' means no pre-release components exist
		throw new Error( `The "package.json" file defines the version "${ packageJson.version }"; pre-release versions are not supported by automatic-release.` );
	}

	// Check the 'repository' field
	if ( !packageJson.hasOwnProperty( 'repository' ) || !packageJson.repository.hasOwnProperty( 'url' ) ) {
		throw new Error( 'The "package.json" file defines no repository URL (and retrieving it from the Git project configuration failed).' );
	}

}

/**
 * Check if any Git tags exist (implying whether a release has been created yet)
 *
 * @returns - Promise, resolves with a flag describing whether any Git tags exist
 */
function hasGitTags(): Promise<boolean> {
	return new Promise<boolean>( ( resolve: ( flag: boolean ) => void, reject: ( error: Error ) => void ) => {

		// Get all git tags
		git( process.cwd() )
				.tags( ( gitTagsError: Error | null, gitTags: GitTags ) => {

				// Handle errors
				if ( gitTagsError ) {
					reject( new Error( `An error has occured while retrieving the project's Git tags. [${ gitTagsError.message }]` ) );
					return;
				}

				resolve( gitTags.all.length !== 0 );

			} );

	} );
}

/**
 * Evaluate the new version, based on the old version and the commits happening since then
 *
 * @param   oldVersion - Old version
 * @returns            - Promise, resolves with new version
 */
function getNewVersion( oldVersion: string ): Promise<string> {
	return new Promise<string>( ( resolve: ( newVersion: string ) => void, reject: ( error: Error ) => void ) => {

		// Evaluate version bump
		conventionalRecommendedBump( {
			preset: 'angular'
		}, ( error: Error | null, recommendedBump: RecommendedBump ) => {

			// Handle errors
			if ( error ) {
				reject( new Error( `An error occured while evaluating the next version. [${ error.message }]` ) );
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

		// Create a github client, then authenticate
		// Weirdly enough, this seems to never throw an error, even when the github token itself is invalid
		const github = new GitHubApi( {
			timeout: 5000
		} );
		github.authenticate( {
			type: 'oauth',
			token: githubToken
		} );

		// We actually don't care about the collaborators - but we can "miss-use" this API request to check that the GitHub token is valid
		// and veryify that we actually do have access to public repository information (the correct GitHub token scope).
		// While the GitHub authorization API would be more meaningful here, it is restricted to usage with basic-auth only ... :/
		github.repos.getCollaborators( {
			owner: repositoryOwner,
			repo: repositoryName
		}, ( error: any | null, collaborators: any ) => { // We don't care about the answer

			if ( error ) {
				reject( new Error( `An error occured while verifying the GitHub token. [${ error.headers.status }: "${ JSON.parse( error.message ).message }"]` ) );
				return;
			}

			resolve( githubToken );

		} );

	} );
}
