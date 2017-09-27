import * as fs from 'fs';
import * as path from 'path';
import * as child_process from 'child_process';

import * as del from 'del';
import * as git from 'simple-git';

import { PackageJson } from '../../src/interfaces/package-json.interface';
import { initGitCommits } from './../utilities/init-git-commits';
import { initGitRepository } from './../utilities/init-git-repository';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;

describe( 'Automatic Release: First Release', () => {

	const projectPath: string = path.resolve( process.cwd(), 'dist-test' );
	let originalProcessCwd: any;

	// Setup
	beforeAll( async() => {

		jest.resetModules();

		jest.doMock( 'child_process', () => {
			return {

				// Switch the working directory (used by 'git-raw-commits')
				execFile: ( fileName: string, args: Array<string>, options: child_process.ExecFileOptions ): child_process.ChildProcess => {
					const newOptions: child_process.ExecFileOptions = Object.assign( options, {
						cwd: projectPath
					} );
					return child_process.execFile( fileName, args, newOptions );
				},

				// Simply forward (used by 'simple-git')
				spawn: child_process.spawn

			}
		} );

		jest.doMock( './../../node_modules/conventional-changelog-core/node_modules/load-json-file', () => {
			return ( filePath: string ) => {
				return Promise.resolve( getInitialPackageJson() );
			}
		} );

		// Hide logging output
		jest.spyOn( console, 'log' ).mockImplementation( () => {
			return;
		} );

		await del( projectPath );
		fs.mkdirSync( projectPath );

		originalProcessCwd = process.cwd
		process.cwd = () => projectPath;

		// Prepare
		fs.writeFileSync( path.resolve( projectPath, 'package.json' ), JSON.stringify( getInitialPackageJson(), null, '	' ), 'utf-8' );
		await initGitRepository( projectPath );
		await initGitCommits( projectPath, 'minor' );

		// Run
		const automaticRelease: () => Promise<void> = ( await import( './../../index' ) ).automaticRelease;
		await automaticRelease();

	} );

	afterAll( () => {

		process.cwd = originalProcessCwd;

	} );

	it ( 'should update the "package.json" file', async() => {

		const packageJson: PackageJson = JSON.parse( fs.readFileSync( path.resolve( projectPath, 'package.json' ), 'utf-8' ) );

		// Check package.json
		expect( packageJson.version ).toBe( getInitialPackageJson().version ); // First version

	} );

	// TODO: Refactor
	it ( 'should write the "CHANGELOG.md" file', async() => {

		// Get date
		const today: Date = new Date();
		const todayFormatted: string = `${ today.getFullYear() }-${ today.getMonth() + 1 }-${ today.getDate() }`
			.replace( /(^|\D)(\d)(?!\d)/g, '$10$2' );

		// Get informaiton
		const changelog: string = fs.readFileSync( path.resolve( projectPath, 'CHANGELOG.md' ), 'utf-8' );
		const changelogLines: Array<string> = changelog.split( /\r?\n/ );
		const numberOfChangelogLines: number = changelogLines.length;
		const listOfCommits: Array<any> = ( await getCommits( projectPath ) ).slice( 0, 2 ); // We're only interested in 2 commits

		// Check changelog
		expect( numberOfChangelogLines ).toBe( 22 ); // Size

		// Check changelog, header
		expect( changelogLines[ 0 ] ).toBe( '# Changelog' );
		expect( changelogLines[ 1 ] ).toBe( '' );
		expect( changelogLines[ 2 ] ).toBe( `Also see the **[release page](${ getInitialPackageJson().repository.url }/releases)**.` );
		expect( changelogLines[ 3 ] ).toBe( '' );
		expect( changelogLines[ 4 ] ).toBe( '<br>' );
		expect( changelogLines[ 5 ] ).toBe( '' );

		// Check changelog, content
		expect( changelogLines[ 6 ] ).toBe( `## [${ getInitialPackageJson().version }](${ getInitialPackageJson().repository.url }/releases/tag/${ getInitialPackageJson().version }) / ${ todayFormatted }` );
		expect( changelogLines[ 7 ] ).toBe( '' );
		expect( changelogLines[ 8 ] ).toBe( '### Features' );
		expect( changelogLines[ 9 ] ).toBe( '' );
		expect( changelogLines[ 10 ] ).toBe( `* **input:** Add input component ([${ listOfCommits[ 0 ].hash.slice( 0, 7 ) }](${ getInitialPackageJson().repository.url }/commit/${ listOfCommits[ 0 ].hash.slice( 0, 7 ) }))` );
		expect( changelogLines[ 11 ] ).toBe( '' );
		expect( changelogLines[ 12 ] ).toBe( '### Performance Improvements' );
		expect( changelogLines[ 13 ] ).toBe( '' );
		expect( changelogLines[ 14 ] ).toBe( `* **select:** Improve rendering performance for select options loop ([${ listOfCommits[ 1 ].hash.slice( 0, 7 ) }](${ getInitialPackageJson().repository.url }/commit/${ listOfCommits[ 1 ].hash.slice( 0, 7 ) }))` );

		// Check changelog, footer
		expect( changelogLines[ numberOfChangelogLines - 7 ] ).toBe( '' );
		expect( changelogLines[ numberOfChangelogLines - 6 ] ).toBe( '<br>' );
		expect( changelogLines[ numberOfChangelogLines - 5 ] ).toBe( '' );
		expect( changelogLines[ numberOfChangelogLines - 4 ] ).toBe( '---' );
		expect( changelogLines[ numberOfChangelogLines - 3 ] ).toBe( '' );
		expect( changelogLines[ numberOfChangelogLines - 2 ] ).toBe( '<sup>*Changelog generated automatically by [automatic-release](https://github.com/dominique-mueller/automatic-release).*</sup>' );
		expect( changelogLines[ numberOfChangelogLines - 1 ] ).toBe( '' );

	} );

} );

function getInitialPackageJson(): PackageJson {
	return  {
		name: 'automatic-release-test',
		description: 'Lorem ipsum dolor sit amet.',
		version: '1.0.0',
		repository: {
			type: 'git',
			url: 'https://github.com/dominique-mueller/automatic-release-test'
		}
	}
}

// TODO: Add interfaces
function getCommits( projectPath ): Promise<Array<any>> {
	return new Promise( ( resolve: ( commits: Array<any> ) => void, reject: () => void ): void => {

		git( projectPath )
			.checkout( 'develop' )
			.log( ( error: Error | null, data: any ) => {
				resolve( data.all );
			} );

	} );
}
