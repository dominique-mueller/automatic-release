import { AutomaticReleaseInformation } from '../interfaces/automatic-release-information.interface';
import { PackageJson } from '../interfaces/package-json.interface';
import { setupConventionalRecommendedBumpMock } from '../../test/conventional-recommended-bump.mock';
import { setupGithubMock } from '../../test/github.mock';
import { setupReadFileMock } from '../../test/read-file.mock';
import { setupSimpleGitMock } from '../../test/simple-git.mock';
import { setupWriteFileMock } from '../../test/write-file.mock';

/**
 * Collect information - Unit Test
 */
describe( '[STEP 1] Collect information', () => {

	beforeAll( () => {

		// Hide logging output
		jest.spyOn( console, 'log' ).mockImplementation( () => {
			return;
		} );

	} );

	beforeEach( () => {

		jest.resetModules();
		process.env.GH_TOKEN = 'ABCDE777';

	} );

	afterEach( () => {

		delete process.env.GH_TOKEN;

	} );

	it ( 'should collection information for first version', async() => {

		// Setup mocks & spies
		setupSimpleGitMock( false, false, false, false );
		setupGithubMock( false );
		setupConventionalRecommendedBumpMock( false );
		const readFileSpy = jest.fn();
		setupReadFileMock( getPackageJson( 'valid-initial' ), false, readFileSpy );
		const writeFileSpy = jest.fn();
		setupWriteFileMock( false, writeFileSpy );

		const collectInformation = await import( './information' );
		const information: AutomaticReleaseInformation = await collectInformation.collectInformation();

		expect( readFileSpy ).toHaveBeenCalledWith( 'package.json', false );
		expect( writeFileSpy ).toHaveBeenCalledWith( 'package.json', getPackageJson( 'valid-initial' ), false );

		expect( information.isFirstVersion ).toBe( true );
		expect( information.oldVersion ).toBe( '1.0.0' );
		expect( information.newVersion ).toBe( '1.0.0' );

		expect( information.repositoryOwner ).toBe( 'john-doe' );
		expect( information.repositoryName ).toBe( 'test-library' );
		expect( information.repositoryUrl ).toBe( 'https://github.com/john-doe/test-library' );

		expect( information.githubToken ).toBe( 'ABCDE777' );

	} );

	it ( 'should collect information for updated version', async() => {

		// Setup mocks & spies
		setupSimpleGitMock( false, false, false, true );
		setupGithubMock( false );
		setupConventionalRecommendedBumpMock( false );
		const readFileSpy = jest.fn();
		setupReadFileMock( getPackageJson( 'valid-update' ), false, readFileSpy );
		const writeFileSpy = jest.fn();
		setupWriteFileMock( false, writeFileSpy );

		const collectInformation = await import( './information' );
		const information: AutomaticReleaseInformation = await collectInformation.collectInformation();

		expect( readFileSpy ).toHaveBeenCalledWith( 'package.json', false );
		expect( writeFileSpy ).toHaveBeenCalledWith( 'package.json', getPackageJson( 'valid-update' ), false );

		expect( information.isFirstVersion ).toBe( false );
		expect( information.oldVersion ).toBe( '1.1.0' );
		expect( information.newVersion ).toBe( '1.1.1' );

		expect( information.repositoryOwner ).toBe( 'john-doe' );
		expect( information.repositoryName ).toBe( 'test-library' );
		expect( information.repositoryUrl ).toBe( 'https://github.com/john-doe/test-library' );

		expect( information.githubToken ).toBe( 'ABCDE777' );

	} );

	it ( 'should assume "1.0.0" as the initial version (if not defined otherwhise)', async() => {

		// Setup mocks & spies
		setupSimpleGitMock( false, false, false, false );
		setupGithubMock( false );
		setupConventionalRecommendedBumpMock( false );
		setupReadFileMock( getPackageJson( 'invalid-no-version' ) );
		const writeFileSpy = jest.fn();
		setupWriteFileMock( false, writeFileSpy );

		const collectInformation = await import( './information' );
		const information: AutomaticReleaseInformation = await collectInformation.collectInformation();

		expect( information.isFirstVersion ).toBe( true );
		expect( information.oldVersion ).toBe( '1.0.0' );
		expect( information.newVersion ).toBe( '1.0.0' );

	} );

	it ( 'should derive repository information from Git (if necessary)', async() => {

		// Setup mocks & spies
		setupSimpleGitMock( false, false, false, false );
		setupGithubMock( false );
		setupConventionalRecommendedBumpMock( false );
		setupReadFileMock( getPackageJson( 'invalid-no-repository' ) );
		const writeFileSpy = jest.fn();
		setupWriteFileMock( false, writeFileSpy );

		const collectInformation = await import( './information' );
		const information: AutomaticReleaseInformation = await collectInformation.collectInformation();

		expect( information.repositoryOwner ).toBe( 'john-doe' );
		expect( information.repositoryName ).toBe( 'test-library' );
		expect( information.repositoryUrl ).toBe( 'https://github.com/john-doe/test-library' );

	} );

	it ( 'should throw an error when reading the "package.json" file fails', async() => {

		// Setup mocks & spies
		setupSimpleGitMock( false, false, false, false );
		setupGithubMock( false );
		setupConventionalRecommendedBumpMock( false );
		const readFileSpy = jest.fn();
		setupReadFileMock( getPackageJson( 'valid-initial' ), true, readFileSpy );
		const writeFileSpy = jest.fn();
		setupWriteFileMock( false, writeFileSpy );

		const collectInformation = await import( './information' );
		let information: AutomaticReleaseInformation | null = null;
		let errorMessage: string | null = null;
		try {
			information = await collectInformation.collectInformation();
		} catch ( error ) {
			errorMessage = error.message;
		}

		expect( information ).toBeNull();
		expect( errorMessage ).toBe( 'An error occured.' );
		expect( readFileSpy ).toHaveBeenCalledWith( 'package.json', false );
        expect( writeFileSpy ).not.toHaveBeenCalled();

	} );

	it ( 'should throw an error when writing the updated "package.json" file fails', async() => {

		// Setup mocks & spies
		setupSimpleGitMock( false, false, false, false );
		setupGithubMock( false );
		setupConventionalRecommendedBumpMock( false );
		const readFileSpy = jest.fn();
		setupReadFileMock( getPackageJson( 'valid-initial' ), false, readFileSpy );
		const writeFileSpy = jest.fn();
		setupWriteFileMock( true, writeFileSpy );

		const collectInformation = await import( './information' );
		let information: AutomaticReleaseInformation | null = null;
		let errorMessage: string | null = null;
		try {
			information = await collectInformation.collectInformation();
		} catch ( error ) {
			errorMessage = error.message;
		}

		expect( information ).toBeNull();
		expect( errorMessage ).toBe( 'An error occured.' );
		expect( readFileSpy ).toHaveBeenCalledWith( 'package.json', false );
        expect( writeFileSpy ).toHaveBeenCalledWith( 'package.json', getPackageJson( 'valid-initial' ), false );

	} );

	it ( 'should throw an error when using an invalid version', async() => {

		// Setup mocks & spies
		setupSimpleGitMock( false, false, false, false );
		setupGithubMock( false );
		setupConventionalRecommendedBumpMock( false );
		setupReadFileMock( getPackageJson( 'invalid-wrong-version' ) );
		setupWriteFileMock( false );

		const collectInformation = await import( './information' );
		let information: AutomaticReleaseInformation | null = null;
		let errorMessage: string | null = null;
		try {
			information = await collectInformation.collectInformation();
		} catch ( error ) {
			errorMessage = error.message;
		}

		expect( information ).toBeNull();
		expect( errorMessage ).toBe( `The "package.json" file defines the version "${ getPackageJson( 'invalid-wrong-version' ).version }"; regarding semantic versioning this is not a valid version number.` );

	} );

	it ( 'should throw an error when using a pre-release version', async() => {

		// Setup mocks & spies
		setupSimpleGitMock( false, false, false, false );
		setupGithubMock( false );
		setupConventionalRecommendedBumpMock( false );
		setupReadFileMock( getPackageJson( 'invalid-prerelease-version' ) );
		setupWriteFileMock( false );

		const collectInformation = await import( './information' );
		let information: AutomaticReleaseInformation | null = null;
		let errorMessage: string | null = null;
		try {
			information = await collectInformation.collectInformation();
		} catch ( error ) {
			errorMessage = error.message;
		}

		expect( information ).toBeNull();
		expect( errorMessage ).toBe( `The "package.json" file defines the version "${ getPackageJson( 'invalid-prerelease-version' ).version }"; pre-release versions are not supported by automatic-release.` );

	} );

	it ( 'should throw an error when deriving repository information fails', async() => {

		// Setup mocks & spies
		setupSimpleGitMock( false, true, false, false );
		setupGithubMock( true );
		setupConventionalRecommendedBumpMock( false );
		setupReadFileMock( getPackageJson( 'invalid-no-repository' ) );
		setupWriteFileMock( false );

		const collectInformation = await import( './information' );
		let information: AutomaticReleaseInformation | null = null;
		let errorMessage: string | null = null;
		try {
			information = await collectInformation.collectInformation();
		} catch ( error ) {
			errorMessage = error.message;
		}

		expect( information ).toBeNull();
		expect( errorMessage ).toBe( 'The "package.json" file defines no repository URL (and retrieving it from the Git project configuration failed).' );

	} );

	it ( 'should throw an error when deriving repository information fails, due to missing remotes', async() => {

		// Setup mocks & spies
		setupSimpleGitMock( false, false, true, false );
		setupGithubMock( true );
		setupConventionalRecommendedBumpMock( false );
		setupReadFileMock( getPackageJson( 'invalid-no-repository' ) );
		setupWriteFileMock( false );

		const collectInformation = await import( './information' );
		let information: AutomaticReleaseInformation | null = null;
		let errorMessage: string | null = null;
		try {
			information = await collectInformation.collectInformation();
		} catch ( error ) {
			errorMessage = error.message;
		}

		expect( information ).toBeNull();
		expect( errorMessage ).toBe( 'The "package.json" file defines no repository URL (and retrieving it from the Git project configuration failed).' );

	} );

	it ( 'should throw an error when retrieving git tags fails', async() => {

		// Setup mocks & spies
		setupSimpleGitMock( true, false, false, false );
		setupGithubMock( false );
		setupConventionalRecommendedBumpMock( false );
		setupReadFileMock( getPackageJson( 'valid-initial' ) );
		setupWriteFileMock( false );

		const collectInformation = await import( './information' );
		let information: AutomaticReleaseInformation | null = null;
		let errorMessage: string | null = null;
		try {
			information = await collectInformation.collectInformation();
		} catch ( error ) {
			errorMessage = error.message;
		}

		expect( information ).toBeNull();
		expect( errorMessage ).toBe( 'An error has occured while retrieving the project\'s Git tags. [An error occured.]' );

	} );

	it ( 'should throw an error when evaluating the recommended next version fails', async() => {

		// Setup mocks & spies
		setupSimpleGitMock( false, false, false, true );
		setupGithubMock( false );
		setupConventionalRecommendedBumpMock( true );
		setupReadFileMock( getPackageJson( 'valid-update' ) );
		setupWriteFileMock( false );

		const collectInformation = await import( './information' );
		let information: AutomaticReleaseInformation | null = null;
		let errorMessage: string | null = null;
		try {
			information = await collectInformation.collectInformation();
		} catch ( error ) {
			errorMessage = error.message;
		}

		expect( information ).toBeNull();
		expect( errorMessage ).toBe( 'An error occured while evaluating the next version. [An error occured.]' );

	} );

	it ( 'should throw an error when the GitHub API token is not set', async() => {

		// Setup mocks & spies
		delete process.env.GH_TOKEN; // Unset again
		setupSimpleGitMock( false, false, false, false );
		setupGithubMock( false );
		setupConventionalRecommendedBumpMock( false );
		setupReadFileMock( getPackageJson( 'valid-initial' ) );
		setupWriteFileMock( false );

		const collectInformation = await import( './information' );
		let information: AutomaticReleaseInformation | null = null;
		let errorMessage: string | null = null;
		try {
			information = await collectInformation.collectInformation();
		} catch ( error ) {
			errorMessage = error.message;
		}

		expect( information ).toBeNull();
		expect( errorMessage ).toBe( 'The "GH_TOKEN" environment variable is not set.' );

	} );

	it ( 'should throw an error when the GitHub API token is invalid', async() => {

		// Setup mocks & spies
		setupSimpleGitMock( false, false, false, false );
		setupGithubMock( true );
		setupConventionalRecommendedBumpMock( false );
		setupReadFileMock( getPackageJson( 'valid-initial' ) );
		setupWriteFileMock( false );

		const collectInformation = await import( './information' );
		let information: AutomaticReleaseInformation | null = null;
		let errorMessage: string | null = null;
		try {
			information = await collectInformation.collectInformation();
		} catch ( error ) {
			errorMessage = error.message;
		}

		expect( information ).toBeNull();
		expect( errorMessage ).toBe( 'An error occured while verifying the GitHub token. [500: "An error occured."]' );

	} );

} );

/**
 * Get package JSON (separate objects for each test case)
 */
function getPackageJson( type: string ): PackageJson {

	switch ( type ) {

		case 'valid-initial':
			return {
				name: 'test-library',
				description: 'Lorem ipsum dolor sit amet.',
				version: '1.0.0',
				repository: {
					"type": "git",
					"url": "https://github.com/john-doe/test-library"
				}
			};

		case 'valid-update':
			return {
				name: 'test-library',
				description: 'Lorem ipsum dolor sit amet.',
				version: '1.1.0',
				repository: {
					"type": "git",
					"url": "https://github.com/john-doe/test-library"
				}
			};

		case 'invalid-no-version':
			return {
				name: 'test-library',
				description: 'Lorem ipsum dolor sit amet.',
				repository: {
					"type": "git",
					"url": "https://github.com/john-doe/test-library"
				}
			};

		case 'invalid-wrong-version':
			return {
				name: 'test-library',
				description: 'Lorem ipsum dolor sit amet.',
				version: 'abcde',
				repository: {
					"type": "git",
					"url": "https://github.com/john-doe/test-library"
				}
			};

		case 'invalid-prerelease-version':
			return {
				name: 'test-library',
				description: 'Lorem ipsum dolor sit amet.',
				version: '2.0.0-alpha.2',
				repository: {
					"type": "git",
					"url": "https://github.com/john-doe/test-library"
				}
			};

		case 'invalid-no-repository':
			return {
				name: 'test-library',
				description: 'Lorem ipsum dolor sit amet.',
				version: '1.0.0'
			};

	}

}
