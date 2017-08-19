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
		const packageJson: PackageJson = await validateAndCorrectPackageJson( await readFile( 'package.json' ) );
		await writeFile( 'package.json', packageJson );

		const information: AutomaticReleaseInformation = {};

		// Get version information
		information.isFirstVersion = !( await hasGitTags() );
		information.oldVersion = packageJson.version;
		information.newVersion = information.isFirstVersion ? information.oldVersion : await getNewVersion( information.oldVersion );

		// Get repository information
		const details: GithubUrl = parseGithubUrl( packageJson.repository.url );
		information.repositoryOwner = details.owner;
		information.repositoryName = details.name;
		information.repositoryUrl = details.href;

		// Get GitHub authorization details
		information.githubToken = await getVerifiedGithubToken( information.repositoryOwner, information.repositoryName );

		resolve( information );

	} );
}

/**
 * Try to validate and - if necessary / possible also correct - the package json content
 *
 * @param   content - Original package json content
 * @returns         - Corrected package json content
 */
function validateAndCorrectPackageJson( content: PackageJson ): Promise<PackageJson> {
	return new Promise<PackageJson>( async( resolve: ( correctedContent: PackageJson ) => void, reject: ( error: Error ) => void ) => {

		const correctedContent: PackageJson = content;

		// Check the 'version' field
		if ( !correctedContent.hasOwnProperty( 'version' ) ) {
			correctedContent.version = '1.0.0'; // TODO: Log info or warning
		}
		if ( semver.valid( correctedContent.version ) === null ) { // 'null' means invalid
			reject( new Error( 'The "package.json" file has a version which is invalid.' ) ); // TODO: Writing
			return;
		}
		if ( semver.prerelease( correctedContent.version ) !== null ) { // 'null' means no pre-release components exist
			reject( new Error( 'The "package.json" file has a version which implies a pre-release; this library only supports full releases.' ) ); // TODO: Writing
			return;
		}

		// Check the 'repository' field
		if ( !correctedContent.hasOwnProperty( 'repository' ) ) { // TODO: Log info or warning
			correctedContent.repository = {
				type: 'git'
			};
		}
		if ( !correctedContent.repository.hasOwnProperty( 'url' ) ) { // TODO: Log info or warning
			try {
				correctedContent.repository.url = await getGitRemoteUrl();
			} catch ( repositoryUrlError ) {
				reject( repositoryUrlError );
				return;
			}
		}

		resolve( correctedContent );

	} );
}

/**
 * Get the Git remote URL from the git project settings / configuration (if possible)
 *
 * @returns - Promise, resolves with the git remote URL
 */
function getGitRemoteUrl(): Promise<string> {
	return new Promise<string>( ( resolve: ( url: string ) => void, reject: ( error: Error ) => void ) => {

		// Get all remotes (verbose=true also gives us the URLs)
		git().getRemotes( true, ( gitGetRemotesError: Error | null, gitRemotes: Array<GitRemote> ) => {

			// Handle errors
			if ( gitGetRemotesError ) {
				reject( gitGetRemotesError );
				return;
			}

			// List of git remotes is '[ { name: '', refs: {} } ]' wheh no remotes are available
			if ( gitRemotes[ 0 ].name === '' || !gitRemotes[ 0 ].refs.hasOwnProperty( 'fetch' ) ) {
				reject( new Error( 'No git remotes found.' ) );
				return;
			}

			// Return the normalized git path
			const normalizedGitPath: string = gitRemotes[ 0 ].refs.fetch.replace( '.git', '' );
			resolve( normalizedGitPath );

		} );

	} );
}

/**
 * Check if any Git tags exist (implying whether a release has been created yet)
 *
 * @returns - Promise, resolves with a flag describing whether any Git tags exist
 */
function hasGitTags(): Promise<boolean> {
	return new Promise<boolean>( ( resolve: ( flag: boolean ) => void, reject: ( error: Error ) => void ) => {

		// Get all git tags
		git().tags( ( gitTagsError: Error | null, gitTags: GitTags ) => {

			// Handle errors
			if ( gitTagsError ) {
				reject( gitTagsError ); // TODO: Handle error
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
function getVerifiedGithubToken( repositoryOwner: string, repositoryName: string ): Promise<string> {
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
		}, ( error: Error | null, collaborators: any ) => { // We don't care about the answer

			if ( error ) {
				reject( error ); // TODO: Handle error
				return;
			}

			resolve( githubToken );

		} );

	} );
}
