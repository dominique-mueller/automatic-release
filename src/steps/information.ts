import * as fs from 'fs';
import * as path from 'path';

import * as git from 'simple-git';
import * as semver from 'semver';
import * as conventionalRecommendedBump from 'conventional-recommended-bump';
import * as GitHubApi from 'github';
import * as parseGithubUrl from 'parse-github-url';

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

		const information: any = {};

		// Read package file
		information.newPackageJson = await readPackageJsonFile();
		information.newPackageJson = await validatePackageJsonFileContent( information.newPackageJson );

		// Get version information
		const isFirstVersion: boolean = await !hasGitTags();
		information.version = {
			isFirst: isFirstVersion,
			old: information.newPackageJson.version,
			new: isFirstVersion ? information.version.old : await evaluateNewVersion( information.newPackageJson.version )
		};
		information.newPackageJson.version = information.version.new;

		// Get repository information
		const details: any = parseGithubUrl( information.newPackageJson.repository.url );
		information.repository = {
			owner: details.owner,
			name: details.name
		};

		// Get GitHub authorization details
		// information.githubToken = await getGithubToken( information.repository.owner, information.repository.name );

		console.log( information );
		resolve( information );

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

function readPackageJsonFile(): Promise<any> {
	return new Promise<any>( ( resolve: ( fileContent: any ) => void, reject: ( error: Error ) => void ) => {

		fs.readFile( path.resolve( process.cwd(), 'package.json' ), 'utf-8', ( error: Error, fileContent: any ) => {

			if ( error ) {
				reject( error ); // TODO: Handle error
				return;
			}

			let parsedFileContent: any;
			try {
				parsedFileContent = JSON.parse( fileContent );
			} catch( parseError ) {
				reject( parseError ); // TODO: Handle error
				return;
			}

			resolve( parsedFileContent );

		} );

	} );
}

function validatePackageJsonFileContent( fileContent: any ): Promise<any> {
	return new Promise<any>( async( resolve: ( correctedFileContent: any ) => void, reject: ( error: Error ) => void ) => {

		const correctedFileContent: any = fileContent;

		// Check the 'version' field
		if ( !fileContent.hasOwnProperty( 'version' ) ) {
			correctedFileContent.version = '1.0.0'; // TODO: Log info or warning
		}
		if ( semver.valid( fileContent.version ) === null ) {
			reject( new Error( 'The "package.json" file has an invalid version.' ) ); // TODO: Writing
		}
		if ( semver.prerelease( fileContent.version ) !== null ) {
			reject( new Error( 'The "package.json" file has a pre-release version, this library only supports full releases.' ) ); // TODO: Writing
		}

		// Check the 'repository' field
		if ( !fileContent.hasOwnProperty( 'repository' ) ) { // TODO: Log info or warning
			correctedFileContent.repository = {
				type: 'git'
			};
		}
		if ( !fileContent.repository.hasOwnProperty( 'url' ) ) { // TODO: Log info or warning
			correctedFileContent.repository.url = await getGitRemoteUrl(); // TODO: Re-throw error
		}

		resolve( correctedFileContent );

	} );
}

function getGitRemoteUrl(): Promise<any> {
	return new Promise<any>( ( resolve: ( url: string ) => void, reject: ( error: Error ) => void ) => {

		git().getRemotes( true, ( error: Error, remotes: any ) => {

			if ( error ) {
				reject( error ); // TODO: Handle error
				return;
			}

			if ( remotes.length > 0 && remotes[ 0 ].hasOwnProperty( 'refs' ) && remotes[ 0 ].refs.hasOwnProperty( 'fetch' ) ) {
				resolve( remotes[ 0 ].refs.fetch.replace( '.git', '' ) );
			} else {
				reject( new Error( 'No remotes found.' ) ); // TODO: Handle error
			}

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
