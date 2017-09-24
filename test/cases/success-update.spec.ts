import * as fs from 'fs';
import * as path from 'path';
import * as child_process from 'child_process';

import * as del from 'del';
import * as git from 'simple-git';

import { PackageJson } from '../../src/interfaces/package-json.interface';
import { initGitCommits } from './../utilities/init-git-commits';
import { initGitRepository } from './../utilities/init-git-repository';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;

describe( 'Automatic Release', () => {

	const projectPath: string = path.resolve( process.cwd(), 'dist-test' );
	let originalProcessCwd: any;

	// Setup
	beforeAll( async() => {

		jest.resetModules();

		jest.doMock( 'child_process', () => {
			return {

				// Switch the working directory (used by 'git-raw-commits')
				execFile: ( fileName: string, args: any, options: any ): child_process.ChildProcess => {
					const newOptions: any = Object.assign( options, {
						cwd: 'dist-test'
					} );
					return child_process.execFile( fileName, args, newOptions );
				},

				// Simply forward (used by 'simple-git')
				spawn: child_process.spawn

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

	} );

	afterAll( () => {

		process.cwd = originalProcessCwd;

	} );

	it ( 'should make a first release', async() => {

		fs.writeFileSync( path.resolve( projectPath, 'package.json' ), JSON.stringify( packageJson, null, '	' ), 'utf-8' );
		await initGitRepository( projectPath );
		await initGitCommits( projectPath, 'minor' );

		const automaticRelease: () => Promise<void> = ( await import( './../../index' ) ).automaticRelease;
		await automaticRelease();

		const updatedPackageJson: PackageJson = JSON.parse( fs.readFileSync( path.resolve( projectPath, 'package.json' ), 'utf-8' ) );
		expect( updatedPackageJson.version ).toBe( packageJson.version ); // First version

	} );

} );

const packageJson: PackageJson = {
	name: 'test-library',
	description: 'Lorem ipsum dolor sit amet.',
	version: '1.0.0',
	repository: {
		type: 'git',
		url: 'https://github.com/dominique-mueller/automatic-release-test'
	}
}
