import { setupWriteFileMock } from '../../test/write-file.mock';
import { setupReadFileMock } from '../../test/read-file.mock';
import { AutomaticReleaseInformation } from '../interfaces/automatic-release-information.interface';
import { PackageJson } from '../interfaces/package-json.interface';
import { setupConventionalRecommendedBumpMock } from '../../test/conventional-recommended-bump.mock';
import { setupGithubMock } from '../../test/github.mock';
import { setupSimpleGitMock } from '../../test/simple-git.mock';
// import * as log from '../log';

/**
 * Collect information - Unit Test
 */
describe( 'Collect information', () => {

	beforeEach( async() => {

		jest.resetModules();

		// Mocks
		setupGithubMock();
		setupConventionalRecommendedBumpMock();
		jest.spyOn( console, 'log' ).mockImplementation( () => {
			return;
		} );

		process.env.GH_TOKEN = 'ABCDE777';

	} );

	afterEach( () => {

		delete process.env.GH_TOKEN;

	} );

	it ( 'should release first version', async() => {

		// Setup mocks & spies
		setupSimpleGitMock( true );
		const readFileSpy = jest.fn();
		setupReadFileMock( validPackageJsonForInitial, readFileSpy );
		const writeFileSpy = jest.fn();
		setupWriteFileMock( writeFileSpy );

		const collectInformation = await import( './information' );
		const information: AutomaticReleaseInformation = await collectInformation.collectInformation();

		expect( readFileSpy ).toHaveBeenCalledWith( 'package.json', false );
		expect( writeFileSpy ).toHaveBeenCalledWith( 'package.json', validPackageJsonForInitial, false );

		expect( information.isFirstVersion ).toBe( true );
		expect( information.oldVersion ).toBe( '1.0.0' );
		expect( information.newVersion ).toBe( '1.0.0' );

		expect( information.repositoryOwner ).toBe( 'john-doe' );
		expect( information.repositoryName ).toBe( 'test-library' );
		expect( information.repositoryUrl ).toBe( 'https://github.com/john-doe/test-library' );

		expect( information.githubToken ).toBe( 'ABCDE777' );

	} );

	it ( 'should release updated version', async() => {

		// Setup mocks & spies
		setupSimpleGitMock( false );
		const readFileSpy = jest.fn();
		setupReadFileMock( validPackageJsonForUpdate, readFileSpy );
		const writeFileSpy = jest.fn();
		setupWriteFileMock( writeFileSpy );

		const collectInformation = await import( './information' );
		const information: AutomaticReleaseInformation = await collectInformation.collectInformation();

		expect( readFileSpy ).toHaveBeenCalledWith( 'package.json', false );
		expect( writeFileSpy ).toHaveBeenCalledWith( 'package.json', validPackageJsonForUpdate, false );

		expect( information.isFirstVersion ).toBe( false );
		expect( information.oldVersion ).toBe( '1.1.0' );
		expect( information.newVersion ).toBe( '1.1.1' );

		expect( information.repositoryOwner ).toBe( 'john-doe' );
		expect( information.repositoryName ).toBe( 'test-library' );
		expect( information.repositoryUrl ).toBe( 'https://github.com/john-doe/test-library' );

		expect( information.githubToken ).toBe( 'ABCDE777' );

	} );

} );

const validPackageJsonForUpdate: PackageJson = {
	name: 'test-library',
	description: 'Lorem ipsum dolor sit amet.',
	version: '1.1.0',
	repository: {
		"type": "git",
		"url": "https://github.com/john-doe/test-library"
	}
};

const validPackageJsonForInitial: PackageJson = {
	name: 'test-library',
	description: 'Lorem ipsum dolor sit amet.',
	version: '1.0.0',
	repository: {
		"type": "git",
		"url": "https://github.com/john-doe/test-library"
	}
};
