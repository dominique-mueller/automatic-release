import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

import * as del from 'del';

import { doGitCommits } from '../setup/do-git-commits';
import { getGitTags } from '../utilities/get-git-tags';
import { getInitialPackageJson } from '../data/initial-package-json';
import { GitConventionalCommit } from '../interfaces/git-conventional-commit.interface';
import { GithubRelease, getGithubReleases } from '../utilities/get-github-releases';
import { PackageJson } from '../../src/interfaces/package-json.interface';
import { parseChangelog } from '../utilities/parse-changelog';
import { preparedCommits } from '../data/prepared-commits';
import { run } from '../utilities/run';
import { setupGitRepository } from './../setup/setup-git-repository';
import { setupMocks } from '../setup/setup-mocks';
import { testChangelogBreakingChange } from '../shared/test-changelog-breaking-change';
import { testChangelogChange } from '../shared/test-changelog-change';
import { testChangelogFooter } from '../shared/test-changelog-footer';
import { testChangelogHeader } from '../shared/test-changelog-header';

const readFileAsync = promisify( fs.readFile );
const mkdirAsync = promisify( fs.mkdir );
const projectPath: string = path.resolve( process.cwd(), 'dist-test' );

/**
 * Automatic Release: e2e
 */
describe( 'Automatic Release (end-to-end)', () => {

	let originalProcessCwd: () => string;

	// Setup
	beforeAll( async() => {

		// Prepare folder (before changing working directory!!)
		await del( projectPath );
		await mkdirAsync( projectPath );

		// Change working directory to test output folder
		originalProcessCwd = process.cwd
		process.cwd = () => projectPath;

		// Setup repository & mocks
		setupMocks( projectPath );
		await setupGitRepository( projectPath, true, getInitialPackageJson() );

	} );

	afterAll( () => {

		process.cwd = originalProcessCwd;

	} );

	describe( 'First Release', () => {

		let commits: Array<GitConventionalCommit>;

		beforeAll( async() => {

			// Do commits
			commits = await doGitCommits(
				projectPath,
				true,

				// Do commits for all release types
				preparedCommits.none[ 0 ],
				preparedCommits.patch[ 0 ],
				preparedCommits.minor[ 0 ],
				preparedCommits.major[ 0 ]
			);

			// Run automatic release (the test cases will check the result)
			const automaticRelease: () => Promise<void> = ( await import( './../../index' ) ).automaticRelease;
			await automaticRelease();

		} );

		it ( 'should set the correct version in the "package.json" file', async() => {

			const packageJson: PackageJson = JSON.parse( await readFileAsync( path.resolve( projectPath, 'package.json' ), 'utf-8' ) );

			expect( packageJson.version ).toBe( getInitialPackageJson().version );

		} );

		it ( 'should write the "CHANGELOG.md" file', async() => {

			// Get date, get changelog
			const today: string = new Date().toISOString().split( 'T' )[ 0 ];
			const changelog: string = await readFileAsync( path.resolve( projectPath, 'CHANGELOG.md' ), 'utf-8' );
			const [ changelogHeader, changelogContent, changelogFooter ]: Array<Array<string>> = parseChangelog( changelog );

			// Check changelog header & footer
			testChangelogHeader( changelogHeader, getInitialPackageJson().repository.url );
			testChangelogFooter( changelogFooter );

			// Check changelog content
			expect( changelogContent[ 0 ] ).toBe( `## [${ getInitialPackageJson().version }](${ getInitialPackageJson().repository.url }/releases/tag/${ getInitialPackageJson().version }) / ${ today }` );
			expect( changelogContent[ 1 ] ).toBe( '' );
			expect( changelogContent[ 2 ] ).toBe( '### Features' );
			expect( changelogContent[ 3 ] ).toBe( '' );
			testChangelogChange( changelogContent[ 4 ], commits[ 2 ], getInitialPackageJson().repository.url );
			expect( changelogContent[ 5 ] ).toBe( '' );
			expect( changelogContent[ 6 ] ).toBe( '### Performance Improvements' );
			expect( changelogContent[ 7 ] ).toBe( '' );
			testChangelogChange( changelogContent[ 8 ], commits[ 1 ], getInitialPackageJson().repository.url );
			expect( changelogContent[ 9 ] ).toBe( '' );
			expect( changelogContent[ 10 ] ).toBe( '### Refactoring' );
			expect( changelogContent[ 11 ] ).toBe( '' );
			testChangelogChange( changelogContent[ 12 ], commits[ 3 ], getInitialPackageJson().repository.url );
			expect( changelogContent[ 13 ] ).toBe( '' );
			expect( changelogContent[ 14 ] ).toBe( '### BREAKING CHANGES' );
			expect( changelogContent[ 15 ] ).toBe( '' );
			testChangelogBreakingChange( changelogContent[ 16 ], commits[ 3 ] );

		} );

		it ( 'should make the release commit', async() => {

			const releaseCommit = ( await run( 'git show -s --format=%s', projectPath ) ).replace( /\r?\n/, '' );

			expect( releaseCommit ).toBe( `Release ${ getInitialPackageJson().version } [skip ci]` );

		} );

		it ( 'should create the release tag', async() => {

			const gitTags: Array<string> = await getGitTags( projectPath );

			expect( gitTags.length ).toBe( 1 );
			expect( gitTags[ 0 ] ).toBe( getInitialPackageJson().version );

		} );

		it ( 'should update the branches', async() => {

			const developMasterDiff = ( await run( 'git diff origin/develop origin/master', projectPath ) );

			expect( developMasterDiff ).toBe( '' );

		} );

		it ( 'should create the GitHub release', async() => {

			const githubReleases: Array<GithubRelease> = await getGithubReleases();

			// Check changelog details
			expect( githubReleases.length ).toBe( 1 );
			expect( githubReleases[ 0 ].tag_name ).toBe( getInitialPackageJson().version );
			expect( githubReleases[ 0 ].name ).toBe( getInitialPackageJson().version );

			const githubReleaseContent: Array<string> = githubReleases[ 0 ].body.split( /\r?\n/ );

			// Check changelog content
			expect( githubReleaseContent[ 0 ] ).toBe( '### Features' );
			expect( githubReleaseContent[ 1 ] ).toBe( '' );
			testChangelogChange( githubReleaseContent[ 2 ], commits[ 2 ], getInitialPackageJson().repository.url );
			expect( githubReleaseContent[ 3 ] ).toBe( '' );
			expect( githubReleaseContent[ 4 ] ).toBe( '### Performance Improvements' );
			expect( githubReleaseContent[ 5 ] ).toBe( '' );
			testChangelogChange( githubReleaseContent[ 6 ], commits[ 1 ], getInitialPackageJson().repository.url );
			expect( githubReleaseContent[ 7 ] ).toBe( '' );
			expect( githubReleaseContent[ 8 ] ).toBe( '### Refactoring' );
			expect( githubReleaseContent[ 9 ] ).toBe( '' );
			testChangelogChange( githubReleaseContent[ 10 ], commits[ 3 ], getInitialPackageJson().repository.url );
			expect( githubReleaseContent[ 11 ] ).toBe( '' );
			expect( githubReleaseContent[ 12 ] ).toBe( '### BREAKING CHANGES' );
			expect( githubReleaseContent[ 13 ] ).toBe( '' );
			testChangelogBreakingChange( githubReleaseContent[ 14 ], commits[ 3 ] );

		} );

	} );

	describe( 'Second Release', () => {

		it ( 'should TODO', () => {
			// TODO ...
		} );

	} );

} );
