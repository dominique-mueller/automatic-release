import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

import * as del from 'del';

import { PackageJson } from '../../src/interfaces/package-json.interface';
import { setupGitRepository } from './../setup/setup-git-repository';
import { setupMocks } from '../setup/setup-mocks';

const readFileAsync = promisify( fs.readFile );
const mkdirAsync = promisify( fs.mkdir );

/**
 * Automatic Release: Unit Test for Error handling
 */
describe( 'Automatic Release: Error handling', () => {

	let originalProcessCwd: () => string;
	const projectPath: string = path.resolve( process.cwd(), 'dist-test' );

    beforeEach( async() => {

        // Prepare folder (before changing working directory!!)
		await del( projectPath );
		await mkdirAsync( projectPath );

		// Change working directory to test output folder
		originalProcessCwd = process.cwd
		process.cwd = () => projectPath;

		// Setup repository & mocks
		setupMocks( projectPath );

    } );

    afterEach( () => {

        // Reset working directory
        process.cwd = originalProcessCwd;

    } );

    it ( 'should throw an error if the version is missing in the "package.json" file', async() => {

        // Prepare repository
        const initialPackageJson: PackageJson = {
            name: 'automatic-release-test',
            description: 'Lorem ipsum dolor sit amet.',
            repository: {
                type: 'git',
                url: 'https://github.com/dominique-mueller/automatic-release-test'
            }
        };
        await setupGitRepository( projectPath, false, initialPackageJson );

        // Run automatic release (the test cases will check the result)
        let error: Error | null = null;
        try {
            const automaticRelease: () => Promise<void> = ( await import( './../../index' ) ).automaticRelease;
            await automaticRelease();
        } catch ( automaticReleaseError ) {
            error = automaticReleaseError;
        }

        expect( error.message ).toBe( 'The "package.json" file defines no version.' );

    } );

    it ( 'should throw an error if the version defined in the "package.json" is invalid', async() => {

        // Prepare repository
        const initialPackageJson: PackageJson = {
            name: 'automatic-release-test',
            description: 'Lorem ipsum dolor sit amet.',
            version: '1.0.0.0',
            repository: {
                type: 'git',
                url: 'https://github.com/dominique-mueller/automatic-release-test'
            }
        };
        await setupGitRepository( projectPath, false, initialPackageJson );

        // Run automatic release (the test cases will check the result)
        let error: Error | null = null;
        try {
            const automaticRelease: () => Promise<void> = ( await import( './../../index' ) ).automaticRelease;
            await automaticRelease();
        } catch ( automaticReleaseError ) {
            error = automaticReleaseError;
        }

        expect( error.message ).toBe( `The "package.json" file defines the version "${ initialPackageJson.version }"; regarding semantic versioning this is not a valid version number.` );

    } );

    it ( 'should throw an error if the version defined in the "package.json" is not supported', async() => {

        // Prepare repository
        const initialPackageJson: PackageJson = {
            name: 'automatic-release-test',
            description: 'Lorem ipsum dolor sit amet.',
            version: '1.0.0-beta.5',
            repository: {
                type: 'git',
                url: 'https://github.com/dominique-mueller/automatic-release-test'
            }
        };
        await setupGitRepository( projectPath, false, initialPackageJson );

        // Run automatic release (the test cases will check the result)
        let error: Error | null = null;
        try {
            const automaticRelease: () => Promise<void> = ( await import( './../../index' ) ).automaticRelease;
            await automaticRelease();
        } catch ( automaticReleaseError ) {
            error = automaticReleaseError;
        }

        expect( error.message ).toBe( `The "package.json" file defines the version "${ initialPackageJson.version }"; pre-release versions are not supported by automatic-release.` );

    } );

    it ( 'should throw an error if the git repository url is missing in the "package.json"', async() => {

        // Prepare repository
        const initialPackageJson: PackageJson = {
            name: 'automatic-release-test',
            description: 'Lorem ipsum dolor sit amet.',
            version: '1.0.0',
            repository: {}
        };
        await setupGitRepository( projectPath, false, initialPackageJson );

        // Run automatic release (the test cases will check the result)
        let error: Error | null = null;
        try {
            const automaticRelease: () => Promise<void> = ( await import( './../../index' ) ).automaticRelease;
            await automaticRelease();
        } catch ( automaticReleaseError ) {
            error = automaticReleaseError;
        }

        expect( error.message ).toBe( 'The "package.json" file defines no repository URL.' );

    } );

    it ( 'should throw an error if the "GH_TOKEN" is not defined as an environment variable', async() => {

        // BEFORE
        const githubToken: string = process.env.GH_TOKEN;
        delete process.env.GH_TOKEN;

        // Prepare repository
        const initialPackageJson: PackageJson = {
            name: 'automatic-release-test',
            description: 'Lorem ipsum dolor sit amet.',
            version: '1.0.0',
            repository: {
                type: 'git',
                url: 'https://github.com/dominique-mueller/automatic-release-test'
            }
        };
        await setupGitRepository( projectPath, false, initialPackageJson );

        // Run automatic release (the test cases will check the result)
        let error: Error | null = null;
        try {
            const automaticRelease: () => Promise<void> = ( await import( './../../index' ) ).automaticRelease;
            await automaticRelease();
        } catch ( automaticReleaseError ) {
            error = automaticReleaseError;
        }

        expect( error.message ).toBe( 'The "GH_TOKEN" environment variable is not set.' );

        // AFTER
        process.env.GH_TOKEN = githubToken;

    } );

    it ( 'should throw an error if the "GH_TOKEN" environment variable is invalid', async() => {

        // BEFORE
        const githubToken: string = process.env.GH_TOKEN;
        process.env.GH_TOKEN = 'XXXXX';

        // Prepare repository
        const initialPackageJson: PackageJson = {
            name: 'automatic-release-test',
            description: 'Lorem ipsum dolor sit amet.',
            version: '1.0.0',
            repository: {
                type: 'git',
                url: 'https://github.com/dominique-mueller/automatic-release-test'
            }
        };
        await setupGitRepository( projectPath, false, initialPackageJson );

        // Run automatic release (the test cases will check the result)
        let error: Error | null = null;
        try {
            const automaticRelease: () => Promise<void> = ( await import( './../../index' ) ).automaticRelease;
            await automaticRelease();
        } catch ( automaticReleaseError ) {
            error = automaticReleaseError;
        }

        expect( error.message ).toBe( `An error occured while verifying the GitHub token. [401 Unauthorized: \"Bad credentials\"]` );

        // AFTER
        process.env.GH_TOKEN = githubToken;

    } );

} );
