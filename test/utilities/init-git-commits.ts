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

	// Push changes, then switch to master (simulate 'release merge')
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
	await writeFileAsync( path.resolve( projectPath, 'CONTRIBUTORS.md' ), '# Contributors', 'utf-8' );

	// Commit
	const commit: GitConventionalCommit = {
		message: 'Add contributors file'
	};
	commit.hash = await executeCommit( commit, projectPath );

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
	await writeFileAsync( path.resolve( projectPath, 'select.js' ), '// Select', 'utf-8' );

	// Commit
	const commit: GitConventionalCommit = {
		type: 'perf',
		scope: 'select',
		message: 'Improve rendering performance for select options loop'
	};
	commit.hash = await executeCommit( commit, projectPath );

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
	await writeFileAsync( path.resolve( projectPath, 'input.js' ), '// Input', 'utf-8' );

	// Commit
	const commit: GitConventionalCommit = {
		type: 'feat',
		scope: 'input',
		message: 'Add input component\n\n- Add input component implementation\n- Add unit tests\n- Add documentation'
	};
	commit.hash = await executeCommit( commit, projectPath );

	return commit;

}

/**
 * Create commit for a major release
 *
 * @param   projectPath - Project path
 * @returns             - Commit
 */
async function commitForMajor( projectPath: string ): Promise<GitConventionalCommit> {

	// Make changes
	await writeFileAsync( path.resolve( projectPath, 'textarea.js' ), '// Textarea', 'utf-8' );

	// Commit
	const commit: GitConventionalCommit = {
		type: 'refactor',
		scope: 'textarea',
		message: 'Rename "maxlength" attribute to "maxLength"\n\nBREAKING CHANGE: The textarea "maxlength" attribute is now called "maxLength"'
	};
	commit.hash = await executeCommit( commit, projectPath );

	return commit;

}

/**
 * Execute commit
 *
 * @param commit      - Commit
 * @param projectPath - Project path
 */
async function executeCommit( commit: GitConventionalCommit, projectPath: string ): Promise<string> {
	await run( 'git add .', projectPath );
	await run( `git commit -m "${ buildCommitMessage( commit ) }"`, projectPath );
	const commitHash: string = ( await run( 'git show -s --format=%h', projectPath ) ).replace( /\r?\n/, '' );
	return commitHash;
}

/**
 * Build a commit message based on a commit object
 *
 * @param   commit - Commit object
 * @returns        - Commit message
 */
function buildCommitMessage( commit: GitConventionalCommit ): string {
	return commit.type ? `${ commit.type }(${ commit.scope ? commit.scope : '*' }): ${ commit.message }` : commit.message;
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
