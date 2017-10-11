import * as fs from 'fs';
import * as path from 'path';
import * as child_process from 'child_process';
import { promisify } from 'util';

import * as del from 'del';

import { PackageJson } from '../../src/interfaces/package-json.interface';
import { initGitCommits, GitConventionalCommit } from './../utilities/init-git-commits';
import { initGitRepository } from './../utilities/init-git-repository';
import { run } from '../utilities/run';
import { GithubRelease, getGithubReleases } from '../utilities/get-github-releases';
import { getGitTags } from '../utilities/get-git-tags';

const readFileAsync = promisify( fs.readFile );
const mkdirAsync = promisify( fs.mkdir );

jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;

/**
 * Automatic Release: Unit Test for First Release
 */
describe( 'Automatic Release: First Release', () => {

	const projectPath: string = path.resolve( process.cwd(), 'dist-test' );
	let originalProcessCwd: any;
	let commits: Array<GitConventionalCommit>;

	// Setup
	beforeAll( async() => {

		jest.resetModules();

		jest.doMock( 'child_process', () => {
			return {

				// Switch the working directory (used by 'git-raw-commits')
				execFile: ( fileName: string, args: Array<string>, options: child_process.ExecFileOptions = {} ): child_process.ChildProcess => {
					const newOptions: child_process.ExecFileOptions = Object.assign( options, {
						cwd: projectPath
					} );
					return child_process.execFile( fileName, args, newOptions );
				},

				// Switch the working directory (used by 'git-semver-tags' and 'simple-git')
				exec: ( command: string, options: child_process.ExecOptions = {},
					callback?: ( error: Error, stdout: Buffer, stderr: Buffer ) => void ): child_process.ChildProcess => {
					const newOptions: child_process.ExecOptions = Object.assign( options, {
						cwd: projectPath
					} );
					return child_process.exec( command, newOptions, callback );
				},

				// Simply forward (used by 'simple-git')
				spawn: child_process.spawn

			}
		} );

		// Hide logging output
		jest.spyOn( console, 'log' ).mockImplementation( () => {
			return;
		} );

		// Prepare folder (before changing working directory!!)
		await del( projectPath );
		await mkdirAsync( projectPath );

		// Change working directory to test output folder
		originalProcessCwd = process.cwd
		process.cwd = () => projectPath;

		// Prepare repository
		await initGitRepository( projectPath, getInitialPackageJson() );
		commits = await initGitCommits( projectPath, 'minor' ); // Will do 3 commits

		// Run automatic release (the test cases will check the result)
		const automaticRelease: () => Promise<void> = ( await import( './../../index' ) ).automaticRelease;
		await automaticRelease();

	} );

	afterAll( () => {

		process.cwd = originalProcessCwd;

	} );

	it ( 'should set the correct version in the "package.json" file', async() => {

		// Read the package json file
		const packageJsonFile: string = await readFileAsync( path.resolve( projectPath, 'package.json' ), 'utf-8' );
		const packageJson: PackageJson = JSON.parse( packageJsonFile );

		// Check the package.json file
		expect( packageJson.version ).toBe( getInitialPackageJson().version ); // First version

	} );

	it ( 'should write the "CHANGELOG.md" file', async() => {

		// Get date
		const today: string = new Date().toISOString().split( 'T' )[ 0 ];

		// Get changelog
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
		testChangelogEntry( changelogContent[ 4 ], commits[ 1 ], getInitialPackageJson().repository.url );
		expect( changelogContent[ 5 ] ).toBe( '' );
		expect( changelogContent[ 6 ] ).toBe( '### Performance Improvements' );
		expect( changelogContent[ 7 ] ).toBe( '' );
		testChangelogEntry( changelogContent[ 8 ], commits[ 0 ], getInitialPackageJson().repository.url );

	} );

	it ( 'should make the release commit', async() => {

		// Check release commit
		const releaseCommit = ( await run( 'git show -s --format=%s', projectPath ) ).replace( /\r?\n/, '' );
		expect( releaseCommit ).toBe( `Release ${ getInitialPackageJson().version } [skip ci]` );

	} );

	it ( 'should create the release tag', async() => {

		const gitTags: Array<string> = await getGitTags( projectPath );

		expect( gitTags.length ).toBe( 1 );
		expect( gitTags[ 0 ] ).toBe( getInitialPackageJson().version );

	} );

	it ( 'should update the branches', async() => {

		// Check that develop and master branches are 'even' / up to date
		const developMasterDiff = ( await run( 'git diff origin/develop origin/master', projectPath ) );

		expect( developMasterDiff ).toBe( '' );

	} );

	it ( 'should create the GitHub release', async() => {

		const githubReleases: Array<GithubRelease> = await getGithubReleases();

		expect( githubReleases.length ).toBe( 1 );
		expect( githubReleases[ 0 ].tag_name ).toBe( getInitialPackageJson().version );
		expect( githubReleases[ 0 ].name ).toBe( getInitialPackageJson().version );

		const githubReleaseContent: Array<string> = githubReleases[ 0 ].body.split( /\r?\n/ );

		// Check changelog content
		expect( githubReleaseContent[ 0 ] ).toBe( '### Features' );
		expect( githubReleaseContent[ 1 ] ).toBe( '' );
		testChangelogEntry( githubReleaseContent[ 2 ], commits[ 1 ], getInitialPackageJson().repository.url );
		expect( githubReleaseContent[ 3 ] ).toBe( '' );
		expect( githubReleaseContent[ 4 ] ).toBe( '### Performance Improvements' );
		expect( githubReleaseContent[ 5 ] ).toBe( '' );
		testChangelogEntry( githubReleaseContent[ 6 ], commits[ 0 ], getInitialPackageJson().repository.url );

	} );

} );

function testChangelogHeader( changelogHeader: Array<string>, repositoryUrl: string ): void {

	expect( changelogHeader[ 0 ] ).toBe( '# Changelog' );
	expect( changelogHeader[ 1 ] ).toBe( '' );
	expect( changelogHeader[ 2 ] ).toBe( `Also see the **[release page](${ repositoryUrl }/releases)**.` );
	expect( changelogHeader[ 3 ] ).toBe( '' );
	expect( changelogHeader[ 4 ] ).toBe( '<br>' );
	expect( changelogHeader[ 5 ] ).toBe( '' );

}

function testChangelogFooter( changelogFooter: Array<string> ): void {

	expect( changelogFooter[ 0 ] ).toBe( '' );
	expect( changelogFooter[ 1 ] ).toBe( '<br>' );
	expect( changelogFooter[ 2 ] ).toBe( '' );
	expect( changelogFooter[ 3 ] ).toBe( '---' );
	expect( changelogFooter[ 4 ] ).toBe( '' );
	expect( changelogFooter[ 5 ] ).toBe( '<sup>*Changelog generated automatically by [automatic-release](https://github.com/dominique-mueller/automatic-release).*</sup>' );
	expect( changelogFooter[ 6 ] ).toBe( '' );

}

function testChangelogEntry( changelogContentLine: string, commit: GitConventionalCommit, repositoryUrl: string ): void {

	const commitMessage: string = `* **${ commit.scope }:** ${ commit.message.split( '\n' )[ 0 ] }`;
	const commitLink: string = `([${ commit.hash }](${ repositoryUrl }/commit/${ commit.hash }))`;

	expect( changelogContentLine ).toBe( `${ commitMessage } ${ commitLink }` );

}

function parseChangelog( changelog: string ): Array<Array<string>> {
	const changelogLines: Array<string> = changelog.split( /\r?\n/ );
	return [
		changelogLines.slice( 0, 6 ),
		changelogLines.slice( 6, -7 ),
		changelogLines.slice( -7 )
	];
}

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
