import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

import * as del from 'del';

import { doGitCommits } from './setup/do-git-commits';
import { getGitTags } from './utilities/get-git-tags';
import { GitConventionalCommit } from './interfaces/git-conventional-commit.interface';
import { GithubRelease, getGithubReleases } from './utilities/get-github-releases';
import { initialPackageJson } from './data/initial-package-json';
import { PackageJson } from '../src/interfaces/package-json.interface';
import { parseChangelog } from './utilities/parse-changelog';
import { preparedCommits } from './data/prepared-commits';
import { run } from './utilities/run';
import { setGithubDefaultBranch } from './utilities/set-github-default-branch';
import { setupGitRepository } from '././setup/setup-git-repository';
import { setupMocks } from './setup/setup-mocks';
import { testChangelogBreakingChange } from './shared/test-changelog-breaking-change';
import { testChangelogChange } from './shared/test-changelog-change';
import { testChangelogFooter } from './shared/test-changelog-footer';
import { testChangelogHeader } from './shared/test-changelog-header';

const readFileAsync = promisify( fs.readFile );
const mkdirAsync = promisify( fs.mkdir );

/**
 * Automatic Release: end-to-end
 *
 * This test suite is a complete end-to-end test for automatic releases, covering both a first release as well as a 'normal' release after
 * that. It has been written in a way to reflect real use cases, to work in real environments and circumstances - meaning that we use the
 * real dependencies and their code (no mocks or stubs), set up an actual Git repository (connected to a real GitHub remote repository),
 * write files to the disk and do commits as usual and actually communicate with real backend systems. If mocks are being used, they only
 * exist in order to manipulate the working directory (JavaScript execution context), necessary to make automatic release work in the dist
 * test folder.
 *
 * Note: Usually, this test should run green within under a minute.
 */
describe( 'Automatic Release: end-to-end', () => {

	let originalProcessCwd: () => string;
	let commits: Array<GitConventionalCommit> = [];
	const projectPath: string = path.resolve( process.cwd(), 'dist-test' );
	const expectedFirstRelease: string = '1.0.0';
	const expectedSecondRelease: string = '1.1.0';

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
		await setupGitRepository( projectPath, true, initialPackageJson );

	} );

	afterAll( async() => {

		process.cwd = originalProcessCwd;

		// Switch the GitHub repository default branch away from master, then back to master. Eventually, this removes the 'testing' repo
		// from contribution counting -- force-pushing branches & commits 'overwrites' / invalidates previous commits, and switching the
		// default branch results in contribution re-counting. #honesty #weird #idontmaketwohundredcontributionsaday
		await setGithubDefaultBranch( 'develop' );
		await setGithubDefaultBranch( 'master' );

	} );

	describe( 'First Release', () => {

		beforeAll( async() => {

			// Do commits (one for every release type)
			const firstReleaseCommits: Array<GitConventionalCommit> = await doGitCommits(
				projectPath,
				true,
				preparedCommits.none[ 0 ],
				preparedCommits.minor[ 0 ],
				preparedCommits.patch[ 0 ],
				preparedCommits.major[ 0 ]
			);
			commits = [ ...commits, ...firstReleaseCommits ];

			// Run automatic release (the test cases will check the result)
			const automaticRelease: () => Promise<void> = ( await import( './../index' ) ).automaticRelease;
			await automaticRelease();

		} );

		it ( 'should set the correct version in the "package.json" file', async() => {

			const packageJson: PackageJson = JSON.parse( await readFileAsync( path.resolve( projectPath, 'package.json' ), 'utf-8' ) );

			expect( packageJson.version ).toBe( expectedFirstRelease );

		} );

		it ( 'should write the "CHANGELOG.md" file', async() => {

			// Get date, get changelog
			const today: string = new Date().toISOString().split( 'T' )[ 0 ];
			const changelog: string = await readFileAsync( path.resolve( projectPath, 'CHANGELOG.md' ), 'utf-8' );
			const [ changelogHeader, changelogContent, changelogFooter ]: Array<Array<string>> = parseChangelog( changelog );

			// Check changelog header & footer
			testChangelogHeader( changelogHeader, initialPackageJson.repository.url );
			testChangelogFooter( changelogFooter );

			// Check changelog content
			expect( changelogContent.length ).toBe( 17 );
			expect( changelogContent[ 0 ] ).toBe( `## [${ expectedFirstRelease }](${ initialPackageJson.repository.url }/releases/tag/${ expectedFirstRelease }) (${ today })` );
			expect( changelogContent[ 1 ] ).toBe( '' );
			expect( changelogContent[ 2 ] ).toBe( '### Features' );
			expect( changelogContent[ 3 ] ).toBe( '' );
			testChangelogChange( changelogContent[ 4 ], commits[ 1 ], initialPackageJson.repository.url );
			expect( changelogContent[ 5 ] ).toBe( '' );
			expect( changelogContent[ 6 ] ).toBe( '### Performance Improvements' );
			expect( changelogContent[ 7 ] ).toBe( '' );
			testChangelogChange( changelogContent[ 8 ], commits[ 2 ], initialPackageJson.repository.url );
			expect( changelogContent[ 9 ] ).toBe( '' );
			expect( changelogContent[ 10 ] ).toBe( '### Refactoring' );
			expect( changelogContent[ 11 ] ).toBe( '' );
			testChangelogChange( changelogContent[ 12 ], commits[ 3 ], initialPackageJson.repository.url );
			expect( changelogContent[ 13 ] ).toBe( '' );
			expect( changelogContent[ 14 ] ).toBe( '### BREAKING CHANGES' );
			expect( changelogContent[ 15 ] ).toBe( '' );
			testChangelogBreakingChange( changelogContent[ 16 ], commits[ 3 ] );

		} );

		it ( 'should make the release commit', async() => {

			const releaseCommit = ( await run( 'git show -s --format=%s', projectPath ) ).replace( /\r?\n/, '' );

			expect( releaseCommit ).toBe( `Release ${ expectedFirstRelease } [skip ci]` );

		} );

		it ( 'should create the release tag', async() => {

			const gitTags: Array<string> = await getGitTags( projectPath );

			expect( gitTags.length ).toBe( 1 );
			expect( gitTags[ 0 ] ).toBe( expectedFirstRelease );

		} );

		it ( 'should update the branches', async() => {

			const developMasterDiff = ( await run( 'git diff origin/develop origin/master', projectPath ) );

			expect( developMasterDiff ).toBe( '' );

		} );

		it ( 'should create the GitHub release', async() => {

			const githubReleases: Array<GithubRelease> = await getGithubReleases();
			const githubFirstReleaseContent: Array<string> = githubReleases[ 0 ].body.split( /\r?\n/ );

			expect( githubReleases.length ).toBe( 1 );

			// Check changelog details
			expect( githubReleases[ 0 ].tag_name ).toBe( expectedFirstRelease );
			expect( githubReleases[ 0 ].name ).toBe( expectedFirstRelease );
			expect( githubReleases[ 0 ].target_commitish ).toBe( 'master' );

			// Check changelog content
			expect( githubFirstReleaseContent.length ).toBe( 16 );
			expect( githubFirstReleaseContent[ 0 ] ).toBe( '### Features' );
			expect( githubFirstReleaseContent[ 1 ] ).toBe( '' );
			testChangelogChange( githubFirstReleaseContent[ 2 ], commits[ 1 ], initialPackageJson.repository.url );
			expect( githubFirstReleaseContent[ 3 ] ).toBe( '' );
			expect( githubFirstReleaseContent[ 4 ] ).toBe( '### Performance Improvements' );
			expect( githubFirstReleaseContent[ 5 ] ).toBe( '' );
			testChangelogChange( githubFirstReleaseContent[ 6 ], commits[ 2 ], initialPackageJson.repository.url );
			expect( githubFirstReleaseContent[ 7 ] ).toBe( '' );
			expect( githubFirstReleaseContent[ 8 ] ).toBe( '### Refactoring' );
			expect( githubFirstReleaseContent[ 9 ] ).toBe( '' );
			testChangelogChange( githubFirstReleaseContent[ 10 ], commits[ 3 ], initialPackageJson.repository.url );
			expect( githubFirstReleaseContent[ 11 ] ).toBe( '' );
			expect( githubFirstReleaseContent[ 12 ] ).toBe( '### BREAKING CHANGES' );
			expect( githubFirstReleaseContent[ 13 ] ).toBe( '' );
			testChangelogBreakingChange( githubFirstReleaseContent[ 14 ], commits[ 3 ] );
			expect( githubFirstReleaseContent[ 15 ] ).toBe( '' );

		} );

	} );

	describe( 'Second Release', () => {

		beforeAll( async() => {

			// Do commits (resulting in 'minor' release)
			const secondReleaseCommits: Array<GitConventionalCommit> = await doGitCommits(
				projectPath,
				true,
				preparedCommits.patch[ 1 ],
				preparedCommits.minor[ 1 ],
			);
			commits = [ ...commits, ...secondReleaseCommits ];

			// Run automatic release (the test cases will check the result)
			const automaticRelease: () => Promise<void> = ( await import( './../index' ) ).automaticRelease;
			await automaticRelease();

		} );

		it ( 'should set the correct version in the "package.json" file', async() => {

			const packageJson: PackageJson = JSON.parse( await readFileAsync( path.resolve( projectPath, 'package.json' ), 'utf-8' ) );

			expect( packageJson.version ).toBe( expectedSecondRelease );

		} );

		it ( 'should write the "CHANGELOG.md" file', async() => {

			// Get date, get changelog
			const today: string = new Date().toISOString().split( 'T' )[ 0 ];
			const changelog: string = await readFileAsync( path.resolve( projectPath, 'CHANGELOG.md' ), 'utf-8' );
			const [ changelogHeader, changelogContent, changelogFooter ]: Array<Array<string>> = parseChangelog( changelog );

			// Check changelog header & footer
			testChangelogHeader( changelogHeader, initialPackageJson.repository.url );
			testChangelogFooter( changelogFooter );

			// Release '1.1.0'
			expect( changelogContent.length ).toBe( 29 );
			expect( changelogContent[ 0 ] ).toBe( `## [${ expectedSecondRelease }](${ initialPackageJson.repository.url }/releases/tag/${ expectedSecondRelease }) (${ today })` );
			expect( changelogContent[ 1 ] ).toBe( '' );
			expect( changelogContent[ 2 ] ).toBe( '### Bug Fixes' );
			expect( changelogContent[ 3 ] ).toBe( '' );
			testChangelogChange( changelogContent[ 4 ], commits[ 4 ], initialPackageJson.repository.url );
			expect( changelogContent[ 5 ] ).toBe( '' );
			expect( changelogContent[ 6 ] ).toBe( '### Features' );
			expect( changelogContent[ 7 ] ).toBe( '' );
			testChangelogChange( changelogContent[ 8 ], commits[ 5 ], initialPackageJson.repository.url );

			expect( changelogContent[ 9 ] ).toBe( '' );
			expect( changelogContent[ 10 ] ).toBe( '<br>' );
			expect( changelogContent[ 11 ] ).toBe( '' );

			// Release '1.0.0'
			expect( changelogContent[ 12 ] ).toBe( `## [${ expectedFirstRelease }](${ initialPackageJson.repository.url }/releases/tag/${ expectedFirstRelease }) (${ today })` );
			expect( changelogContent[ 13 ] ).toBe( '' );
			expect( changelogContent[ 14 ] ).toBe( '### Features' );
			expect( changelogContent[ 15 ] ).toBe( '' );
			testChangelogChange( changelogContent[ 16 ], commits[ 1 ], initialPackageJson.repository.url );
			expect( changelogContent[ 17 ] ).toBe( '' );
			expect( changelogContent[ 18 ] ).toBe( '### Performance Improvements' );
			expect( changelogContent[ 19 ] ).toBe( '' );
			testChangelogChange( changelogContent[ 20 ], commits[ 2 ], initialPackageJson.repository.url );
			expect( changelogContent[ 21 ] ).toBe( '' );
			expect( changelogContent[ 22 ] ).toBe( '### Refactoring' );
			expect( changelogContent[ 23 ] ).toBe( '' );
			testChangelogChange( changelogContent[ 24 ], commits[ 3 ], initialPackageJson.repository.url );
			expect( changelogContent[ 25 ] ).toBe( '' );
			expect( changelogContent[ 26 ] ).toBe( '### BREAKING CHANGES' );
			expect( changelogContent[ 27 ] ).toBe( '' );
			testChangelogBreakingChange( changelogContent[ 28 ], commits[ 3 ] );

		} );

		it ( 'should make the release commit', async() => {

			const releaseCommit = ( await run( 'git show -s --format=%s', projectPath ) ).replace( /\r?\n/, '' );

			expect( releaseCommit ).toBe( `Release ${ expectedSecondRelease } [skip ci]` );

		} );

		it ( 'should create the release tag', async() => {

			const gitTags: Array<string> = await getGitTags( projectPath );

			expect( gitTags.length ).toBe( 2 );
			expect( gitTags[ 0 ] ).toBe( expectedFirstRelease );
			expect( gitTags[ 1 ] ).toBe( expectedSecondRelease );

		} );

		it ( 'should update the branches', async() => {

			const developMasterDiff = ( await run( 'git diff origin/develop origin/master', projectPath ) );

			expect( developMasterDiff ).toBe( '' );

		} );

		it ( 'should create the GitHub release', async() => {

			const githubReleases: Array<GithubRelease> = await getGithubReleases();
			const githubSecondReleaseContent: Array<string> = githubReleases[ 1 ].body.split( /\r?\n/ );
			const githubFirstReleaseContent: Array<string> = githubReleases[ 0 ].body.split( /\r?\n/ );

			// Check changelog details
			expect( githubReleases[ 1 ].tag_name ).toBe( expectedSecondRelease );
			expect( githubReleases[ 1 ].name ).toBe( expectedSecondRelease );
			expect( githubReleases[ 1 ].target_commitish ).toBe( 'master' );

			// Check changelog content
			expect( githubSecondReleaseContent.length ).toBe( 8 );
			expect( githubSecondReleaseContent[ 0 ] ).toBe( '### Bug Fixes' );
			expect( githubSecondReleaseContent[ 1 ] ).toBe( '' );
			testChangelogChange( githubSecondReleaseContent[ 2 ], commits[ 4 ], initialPackageJson.repository.url );
			expect( githubSecondReleaseContent[ 3 ] ).toBe( '' );
			expect( githubSecondReleaseContent[ 4 ] ).toBe( '### Features' );
			expect( githubSecondReleaseContent[ 5 ] ).toBe( '' );
			testChangelogChange( githubSecondReleaseContent[ 6 ], commits[ 5 ], initialPackageJson.repository.url );
			expect( githubSecondReleaseContent[ 7 ] ).toBe( '' );

			// Check changelog details
			expect( githubReleases[ 0 ].tag_name ).toBe( expectedFirstRelease );
			expect( githubReleases[ 0 ].name ).toBe( expectedFirstRelease );
			expect( githubReleases[ 0 ].target_commitish ).toBe( 'master' );

			// Check changelog content
			expect( githubFirstReleaseContent.length ).toBe( 16 );
			expect( githubFirstReleaseContent[ 0 ] ).toBe( '### Features' );
			expect( githubFirstReleaseContent[ 1 ] ).toBe( '' );
			testChangelogChange( githubFirstReleaseContent[ 2 ], commits[ 1 ], initialPackageJson.repository.url );
			expect( githubFirstReleaseContent[ 3 ] ).toBe( '' );
			expect( githubFirstReleaseContent[ 4 ] ).toBe( '### Performance Improvements' );
			expect( githubFirstReleaseContent[ 5 ] ).toBe( '' );
			testChangelogChange( githubFirstReleaseContent[ 6 ], commits[ 2 ], initialPackageJson.repository.url );
			expect( githubFirstReleaseContent[ 7 ] ).toBe( '' );
			expect( githubFirstReleaseContent[ 8 ] ).toBe( '### Refactoring' );
			expect( githubFirstReleaseContent[ 9 ] ).toBe( '' );
			testChangelogChange( githubFirstReleaseContent[ 10 ], commits[ 3 ], initialPackageJson.repository.url );
			expect( githubFirstReleaseContent[ 11 ] ).toBe( '' );
			expect( githubFirstReleaseContent[ 12 ] ).toBe( '### BREAKING CHANGES' );
			expect( githubFirstReleaseContent[ 13 ] ).toBe( '' );
			testChangelogBreakingChange( githubFirstReleaseContent[ 14 ], commits[ 3 ] );
			expect( githubFirstReleaseContent[ 15 ] ).toBe( '' );

		} );

	} );

} );
