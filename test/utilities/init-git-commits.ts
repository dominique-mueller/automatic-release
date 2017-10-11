import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

import { run } from './run';

const writeFileAsync = promisify( fs.writeFile );

/**
 * Create initial commits
 *
 * @param   projectPath - Project path
 * @param   type        - Release type to generate the commits for
 * @returns             - List of commits
 */
export async function initGitCommits( projectPath: string, type: 'major' | 'minor' | 'patch' | 'none' ): Promise<Array<GitConventionalCommit>> {

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

	// Push changes, then switch to master
	await run( 'git push origin develop', projectPath );
	await run( 'git checkout master', projectPath );
	await run( 'git merge develop', projectPath );
	await run( 'git push origin master', projectPath );

	return conventionalCommits;

}

/**
 * Create commit with no effect on releases
 *
 * @param   projectPath - Project path
 * @returns             - Commit
 */
async function commitForNone( projectPath: string ): Promise<GitConventionalCommit> {

	// Make changes
	const changedFile: string = 'CONTRIBUTORS.md';
	await writeFileAsync( path.resolve( projectPath, changedFile ), '# Contributors', 'utf-8' );

	// Prepare commit
	const commit: GitConventionalCommit = {
		message: 'Add contributors file'
	};

	// Do commit
	await run( `git add ${ changedFile }`, projectPath );
	await run( `git commit -m "${ buildCommitMessage( commit ) }"`, projectPath );
	commit.hash = ( await run( 'git show -s --format=%h', projectPath ) ).replace( /\r?\n/, '' );

	return commit;

}

/**
 * Create commit for a patch release
 *
 * @param   projectPath - Project path
 * @returns             - Commit
 */
async function commitForPatch( projectPath: string ): Promise<GitConventionalCommit> {

	// Make changes
	const changedFile: string = 'select.js';
	await writeFileAsync( path.resolve( projectPath, changedFile ), '// Select', 'utf-8' );

	// Prepare commit
	const commit: GitConventionalCommit = {
		type: 'perf',
		scope: 'select',
		message: 'Improve rendering performance for select options loop'
	};

	// Do commit
	await run( `git add ${ changedFile }`, projectPath );
	await run( `git commit -m "${ buildCommitMessage( commit ) }"`, projectPath );
	commit.hash = ( await run( 'git show -s --format=%h', projectPath ) ).replace( /\r?\n/, '' );

	return commit;

}

/**
 * Create commit for a minor release
 *
 * @param   projectPath - Project path
 * @returns             - Commit
 */
async function commitForMinor( projectPath: string ): Promise<GitConventionalCommit> {

	// Make changes
	const changedFile: string = 'input.js';
	await writeFileAsync( path.resolve( projectPath, changedFile ), '// Input', 'utf-8' );

	// Prepare commit
	const commit: GitConventionalCommit = {
		type: 'feat',
		scope: 'input',
		message: 'Add input component\n\n- Add input component implementation\n- Add unit tests\n- Add documentation'
	};

	// Do commit
	await run( `git add ${ changedFile }`, projectPath );
	await run( `git commit -m "${ buildCommitMessage( commit ) }"`, projectPath );
	commit.hash = ( await run( 'git show -s --format=%h', projectPath ) ).replace( /\r?\n/, '' );

	return commit

}

/**
 * Create commit for a major release
 *
 * @param   projectPath - Project path
 * @returns             - Commit
 */
async function commitForMajor( projectPath: string ): Promise<GitConventionalCommit> {

	// Make changes
	const changedFile: string = 'textarea.js';
	await writeFileAsync( path.resolve( projectPath, changedFile ), '// Textarea', 'utf-8' );

	// Prepare commit
	const commit: GitConventionalCommit = {
		type: 'refactor',
		scope: 'textarea',
		message: 'Rename "maxlength" attribute to "maxLength"\n\nBREAKING CHANGE: The textarea "maxlength" attribute is now called "maxLength"'
	};

	// Do commit
	await run( `git add ${ changedFile }`, projectPath );
	await run( `git commit -m "${ buildCommitMessage( commit ) }"`, projectPath );
	commit.hash = ( await run( 'git show -s --format=%h', projectPath ) ).replace( /\r?\n/, '' );

	return commit;

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
 * Git Conventional Commit interface
 */
export interface GitConventionalCommit {
	type?: string;
	scope?: string;
	message: string;
	hash?: string;
}
