import * as fs from 'fs';
import * as path from 'path';

import * as git from 'simple-git';
import * as semver from 'semver';
import * as recommendedBump from 'conventional-recommended-bump';

export function retrieveInformation(): Promise<any> {
	return new Promise( async( resolve: ( information: any ) => void, reject: ( error: Error ) => void ) => {

		const information: any = {};

		// Read package and version details
		information.isFirstVersion = await !hasGitTags();
		information.packageJson = await readPackageJsonFile();
		information.packageJson = await validatePackageJsonFileContent( information.packageJson );
		information.oldVersion = information.packageJson.version;
		information.newVersion = information.isFirstVersion
			? information.oldVersion
			: await evaluateNewVersion( information.oldVersion );
		information.packageJson.version = information.newVersion;

		// Check for authorized GitHub Token
		// TODO: Move into different file
		// TODO: Verify validity??
		if ( process.env.GH_TOKEN ) {
			information.githubToken = process.env.GH_TOKEN.replace( /\s+/g, '' );
		} else {
			throw new Error( 'The "GH_TOKEN" environment variable cannot be found.' );
		}

		console.log( information );

		resolve( information );

	} );
}



export function hasGitTags(): Promise<boolean> {
	return new Promise( ( resolve: ( flag: boolean ) => void, reject: ( error: Error ) => void ) => {

		git().tags( ( error: Error, tagInformation: { latest: string | undefined, all: Array<string> } ) => {

			if ( error ) {
				reject( error ); // TODO: Handle error
				return;
			}

			resolve( tagInformation.all.length !== 0 );

		} );

	} );
}

export function readPackageJsonFile(): Promise<any> {
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

export function validatePackageJsonFileContent( fileContent: any ): Promise<any> {
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

export function getGitRemoteUrl(): Promise<any> {
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

export function evaluateNewVersion( oldVersion: string ): Promise<string> {
	return new Promise<any>( ( resolve: ( newVersion: string ) => void, reject: ( error: Error ) => void ) => {

		recommendedBump( {
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
