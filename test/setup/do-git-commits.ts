import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

import { run } from '../utilities/run';
import { GitConventionalCommit } from '../interfaces/git-conventional-commit.interface';
import { PreparedCommit } from '../interfaces/prepared-commit.interface';

const writeFileAsync = promisify( fs.writeFile );

/**
 * Execute commits
 *
 * @param   projectPath - Project path
 * @param   useRemote   - Flag, describing whether to use the Git remote repository
 * @param   commits     - List o prepared commits to execute
 * @returns             - List of commits
 */
export async function doGitCommits(
	projectPath: string,
	useRemote: boolean,
	...commits: Array<PreparedCommit>
): Promise<Array<GitConventionalCommit>> {

	await run( 'git checkout develop', projectPath );

	// Do commits
	const commitsResult: Array<GitConventionalCommit> = [];
	for ( let commit of commits ) {
		commitsResult.push( await doGitCommit( projectPath, commit ) );
	}

	// Push changes, then switch to master (simulate 'release merge')
	if ( useRemote ) {
		await run( 'git push origin develop', projectPath );
	}
	await run( 'git checkout master', projectPath );
	await run( 'git merge develop', projectPath );
	if ( useRemote ) {
		await run( 'git push origin master', projectPath );
	}

	return commitsResult;

}

/**
 * Do a git commit
 *
 * @param projectPath    - Project path
 * @param preparedCommit - Prepared commit object
 */
async function doGitCommit( projectPath: string, preparedCommit: PreparedCommit ): Promise<GitConventionalCommit> {

	// Write file
	await writeFileAsync( path.resolve( projectPath, preparedCommit.fileName ), preparedCommit.fileContent, 'utf-8' );

	// Do commit
	const commitMessageArgument: string = ` -m "${ buildCommitMessage( preparedCommit.commit ) }"`;
	const commitBodyArument: string = preparedCommit.commit.body ? ` -m "${ preparedCommit.commit.body }"`: '';
	await run( 'git add .', projectPath );
	await run( `git commit${ commitMessageArgument }${ commitBodyArument }`, projectPath );

	// Get commit hash
	preparedCommit.commit.hash = ( await run( 'git show -s --format=%h', projectPath ) ).replace( /\r?\n/, '' );

	return preparedCommit.commit;

}

/**
 * Build a commit message, following the Angular commit message convention, based on the given commit object
 *
 * @param   commit - Commit object
 * @returns        - Commit message
 */
function buildCommitMessage( commit: GitConventionalCommit ): string {
	return commit.type ? `${ commit.type }(${ commit.scope ? commit.scope : '*' }): ${ commit.message }` : commit.message;
}
