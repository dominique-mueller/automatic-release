import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

import * as git from 'simple-git';

const writeFileAsync = promisify( fs.writeFile );

/**
 * Git Conventional Commit interface
 */
export interface GitConventionalCommit {
	type?: string;
	scope?: string;
	message: string;
	hash?: string;
}

/**
 * Git Commit Log interface
 */
export interface GitCommitLog {
	hash: string;
	date: string; // In the format '2017-09-30 12:30:15 +0200'
	message: string;
	author_name: string;
	author_email: string;
}

/**
 * Make Git Changes
 */
export function initGitCommits( projectPath: string, type: 'major' | 'minor' | 'patch' | 'none' ): Promise<Array<GitConventionalCommit>> {
	return new Promise( async( resolve: ( commits: Array<GitConventionalCommit> ) => void, reject: () => void ): Promise<void> => {

		// Do commits
		const conventionalCommits: Array<GitConventionalCommit> = [];
		await commitForNone( projectPath );
		if ( type === 'patch' || type === 'minor' || type === 'major' ) {
			conventionalCommits.push( await commitForPatch( projectPath ) );
		}
		if ( type === 'minor' || type === 'major' ) {
			conventionalCommits.push( await commitForMinor( projectPath ) );
		}
		if ( type === 'major' ) {
			conventionalCommits.push( await commitForMajor( projectPath ) );
		}

		// Push commits
		await new Promise<void>( ( resolve: () => void, reject: () => void ): void => {
			git( projectPath )
				.push( 'origin', 'develop' )
				.exec( () => {
					resolve();
				} );
		} );

		// Add commit hashes
		const gitCommits: Array<GitCommitLog> = ( await getGitCommits( projectPath ) ).slice( 2 ); // Ignore non-conventional commits
		conventionalCommits
			.map( ( conventionalCommit: GitConventionalCommit, index: number ) => {
				conventionalCommit.hash = gitCommits[ index ].hash.substring( 0, 7 );
				return conventionalCommit;
			} );

		resolve( conventionalCommits );

	} );
}

/**
 * Commit for none
 */
function commitForNone( projectPath: string ): Promise<GitConventionalCommit> {
	return new Promise( async( resolve: ( commit: GitConventionalCommit ) => void, reject: () => void ): Promise<void> => {

		// Make changes
		const changedFile: string = 'CONTRIBUTORS.md';
		await writeFileAsync( path.resolve( projectPath, changedFile ), '# Contributors', 'utf-8' );

		// Prepare commit
		const commit: GitConventionalCommit = {
			message: 'Add contributors file'
		};

		// Execute commit
		git( projectPath )
			.add( changedFile )
			.commit( buildCommitMessage( commit ) )
			.exec( () => {
				resolve( commit );
			} );

	} );
}

/**
 * Commit for path
 */
function commitForPatch( projectPath: string ): Promise<GitConventionalCommit> {
	return new Promise( async( resolve: ( commit: GitConventionalCommit ) => void, reject: () => void ): Promise<void> => {

		// Make changes
		const changedFile: string = 'select.js';
		await writeFileAsync( path.resolve( projectPath, changedFile ), '// Select', 'utf-8' );

		// Prepare commit
		const commit: GitConventionalCommit = {
			type: 'perf',
			scope: 'select',
			message: 'Improve rendering performance for select options loop'
		};

		// Execute commit
		git( projectPath )
			.add( changedFile )
			.commit( buildCommitMessage( commit ) )
			.exec( () => {
				resolve( commit );
			} );

	} );
}

/**
 * Commit for minor
 */
function commitForMinor( projectPath: string ): Promise<GitConventionalCommit> {
	return new Promise( async( resolve: ( commit: GitConventionalCommit ) => void, reject: () => void ): Promise<void> => {

		// Make changes
		const changedFile: string = 'input.js';
		await writeFileAsync( path.resolve( projectPath, changedFile ), '// Input', 'utf-8' );

		// Prepare commit
		const commit: GitConventionalCommit = {
			type: 'feat',
			scope: 'input',
			message: 'Add input component\n\n- Add input component implementation\n- Add unit tests\n- Add documentation'
		};

		// Execute commit
		git( projectPath )
			.add( changedFile )
			.commit( buildCommitMessage( commit ) )
			.exec( () => {
				resolve( commit );
			} );

	} );
}

/**
 * Commit for major
 */
function commitForMajor( projectPath: string ): Promise<GitConventionalCommit> {
	return new Promise( async( resolve: ( commit: GitConventionalCommit ) => void, reject: () => void ): Promise<void> => {

		// Make changes
		const changedFile: string = 'textarea.js';
		await writeFileAsync( path.resolve( projectPath, changedFile ), '// Textarea', 'utf-8' );

		// Prepare commit
		const commit: GitConventionalCommit = {
			type: 'refactor',
			scope: 'textarea',
			message: 'Rename "maxlength" attribute to "maxLength"\n\nBREAKING CHANGE: The textarea "maxlength" attribute is now called "maxLength"'
		};

		// Execute commit
		git( projectPath )
			.add( changedFile )
			.commit( buildCommitMessage( commit ) )
			.exec( () => {
				resolve( commit );
			} );

	} );
}

/**
 * Build a commit message based on a commit object
 *
 * @param   commit - Commit object
 * @returns        - Commit message
 */
function buildCommitMessage( commit: GitConventionalCommit ): string {
	if ( commit.type ) {
		return `${ commit.type }(${ commit.scope ? commit.scope : '*' }): ${ commit.message }`;
	} else {
		return commit.message;
	}
}


/**
 * Get all git commits
 *
 * @param   projectPath - Project path
 * @returns             - List of git commits
 */
function getGitCommits( projectPath ): Promise<Array<GitCommitLog>> {
	return new Promise( ( resolve: ( commits: Array<GitCommitLog> ) => void, reject: () => void ): void => {

		git( projectPath )
			.checkout( 'develop' )
			.log( ( error: Error | null, data: {
				all: Array<GitCommitLog>;
				latest: GitCommitLog,
				total: number
			} ) => {
				resolve( data.all.reverse() );
			} );

	} );
}
