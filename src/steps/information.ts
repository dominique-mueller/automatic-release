import * as fs from 'fs';
import * as path from 'path';

import * as git from 'simple-git';
import * as semver from 'semver';
import * as conventionalRecommendedBump from 'conventional-recommended-bump';
import * as GitHubApi from 'github';
import * as parseGithubUrl from 'parse-github-url';

import { readFile } from './../utilities/read-file';
import { writeFile } from './../utilities/write-file';
import { GitRemote } from './../interfaces/git-remote.interface';
import { PackageJson } from './../interfaces/package-json.interface';

export interface AutomaticReleaseInformation {
	newPackageJson: any;
	version: {
		isFirst: boolean;
		new: string;
		old: string;
	};
	repository: {
		owner: string;
		name: string;
	};
	githubToken: string;
}



export function collectInformation(): Promise<any> {
	return new Promise( async( resolve: ( information: any ) => void, reject: ( error: Error ) => void ) => {

		// Read, correct adn write the package.json file
		const packageJson: PackageJson = await validateAndCorrectPackageJson( await readFile( 'package.json' ) );
		await writeFile( 'package.json', packageJson );
		console.log( packageJson );

		// const information: any = {};

		// Read package file
		// information.newPackageJson = await readFile( 'package.json' );
		// information.newPackageJson = await validatePackageJsonFileContent( information.newPackageJson );

		// Get version information
		// const isFirstVersion: boolean = await !hasGitTags();
		// information.version = {
		// 	isFirst: isFirstVersion,
		// 	old: information.newPackageJson.version,
		// 	new: isFirstVersion ? information.version.old : await evaluateNewVersion( information.newPackageJson.version )
		// };
		// information.newPackageJson.version = information.version.new;

		// // Get repository information
		// const details: any = parseGithubUrl( information.newPackageJson.repository.url );
		// information.repository = {
		// 	owner: details.owner,
		// 	name: details.name
		// };

		// // Get GitHub authorization details
		// information.githubToken = await getGithubToken( information.repository.owner, information.repository.name );

		// resolve( information );

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


function hasGitTags(): Promise<boolean> {
	return new Promise<boolean>( ( resolve: ( flag: boolean ) => void, reject: ( error: Error ) => void ) => {

		git().tags( ( error: Error, tagInformation: { latest: string | undefined, all: Array<string> } ) => {

			if ( error ) {
				reject( error ); // TODO: Handle error
				return;
			}

			resolve( tagInformation.all.length !== 0 );

		} );

	} );
}







function evaluateNewVersion( oldVersion: string ): Promise<string> {
	return new Promise<any>( ( resolve: ( newVersion: string ) => void, reject: ( error: Error ) => void ) => {

		conventionalRecommendedBump( {
			preset: 'angular'
		}, ( error: Error, data: { level: number, reason: string, releaseType: 'major' | 'minor' | 'patch' } ) => {

			if ( error ) {
				reject( error ); // TODO: Handle error
				return;
			}

			const newVersion: string = semver.inc( oldVersion, data.releaseType );
			resolve( newVersion );

		} );

	} );
}

function getGithubToken( repoOwner: string, repoName: string ): Promise<string> {
	return new Promise<string>( ( resolve: ( githubToken: string ) => void, reject: ( error: Error ) => void ) => {

		// Get GitHub token from environment variable
		if ( !process.env.GH_TOKEN ) {
			reject( new Error( 'The "GH_TOKEN" environment variable is not set.' ) ); // TODO: Handle error
			return;
		}
		const githubToken: string = process.env.GH_TOKEN.replace( /\s+/g, '' );

		// const githubToken: string = 'XXX'; // TODO: Remove me

		// Create github client and authenticate (will never throw an error, even if the github token itself is invalid)
		const github = new GitHubApi( {
			timeout: 5000
		} );
		github.authenticate( {
			type: 'oauth',
			token: githubToken
		} );

		// We actually don't care about the collaborators, but we can use this API request to check that
		// - the GitHub token is valid
		// - we do have access to public repository information
		// The authorization API itself, which would be much nicer here, is restricted to basic auth usage only :/
		github.repos.getCollaborators( {
			owner: repoOwner,
			repo: repoName
		}, ( error, data ) => {

			if ( error ) {
				reject( error ); // TODO: Handle error
				return;
			}

			resolve( githubToken );

		} );

	} );
}
