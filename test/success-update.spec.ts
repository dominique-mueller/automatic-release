import * as fs from 'fs';
import * as path from 'path';

import * as del from 'del';
import * as git from 'simple-git';

import { PackageJson } from '../src/interfaces/package-json.interface';

describe( 'Automatic Release', () => {

	const projectPath: string = path.resolve( process.cwd(), 'dist-test' );
	let originalProcessCwd: any;

	// Setup
	beforeAll( async() => {

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

	it ( 'should run through', async() => {

		fs.writeFileSync( path.resolve( projectPath, 'README.md' ), '# TODO' );
		fs.writeFileSync( path.resolve( projectPath, 'package.json' ), JSON.stringify( packageJson, null, '	' ) );

		git( projectPath )
			.init()
			.addConfig( 'user.name', 'Dominique Müller' )
			.addConfig( 'user.email', 'dominique.m.mueller@gmail.com' )
			.addConfig( 'commit.gpgsign', 'false' )
			.addRemote( 'origin', 'https://github.com/dominique-mueller/automatic-release-test' )
			.add( '.' )
			.commit( 'Initial commit' )
			.push( 'origin', 'master', { '--force': null } )
			.checkoutLocalBranch( 'develop' )
			.push( 'origin', 'develop', { '--force': null } );

		fs.writeFileSync( path.resolve( projectPath, 'one.js' ), 'const myFeature = \'My awesome feature.\';' );

		git( projectPath )
			.add( '.' )
			.commit( 'feat()' )

		// const automaticRelease: () => Promise<void> = ( await import( './../index' ) ).automaticRelease;
		// await automaticRelease();

		// expect( process.cwd() ).toBe( projectPath );

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
