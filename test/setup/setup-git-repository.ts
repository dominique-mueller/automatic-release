import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

import { run } from './../utilities/run';
import { getGitTags } from './../utilities/get-git-tags';

const writeFileAsync = promisify( fs.writeFile );

/**
 * Initialize Git Repository; this includes:
 * - setting up a fresh local Git repository, connected to remote
 * - executing the first / initial commit (README and package.json)
 * - force pushed to GitHub remote, replacing whatever exists there
 * - cleaning up all tags, both locally and on remote
 *
 * @param   projectPath - Project path
 * @param   packageJson - Package JSON
 */
export async function setupGitRepository( projectPath: string, packageJson: any ): Promise<void> {

	// Create initial files
	await writeFileAsync( path.resolve( projectPath, 'README.md' ), '# README', 'utf-8' );
	await writeFileAsync( path.resolve( projectPath, 'package.json' ), JSON.stringify( packageJson, null, '	' ), 'utf-8' );

	// Init git repository
	await run( 'git init', projectPath );
	await run( 'git remote add origin https://github.com/dominique-mueller/automatic-release-test', projectPath );

	// Setup user with authentication
	await run( 'git config user.name Dominique Müller', projectPath );
	await run( 'git config user.email dominique.m.mueller@gmail.com', projectPath );
	await run( 'git config credential.helper "store --file=.git/credentials"', projectPath );
	await run( 'echo "https://$GH_TOKEN:@github.com" > .git/credentials', projectPath );
	await run( 'git config commit.gpgsign false', projectPath );

	// Initial commits
	await run( 'git add .', projectPath );
	await run( 'git commit -m "Initial commit"', projectPath );
	await run( 'git checkout -b develop', projectPath );
	await run( 'git push origin --all --force', projectPath );

	// Delete tags
	await run( 'git fetch --tags', projectPath );
	const tags: string = ( await getGitTags( projectPath ) ).join( ' ' );
	await run( `git tag --delete ${ tags }`, projectPath );
	await run( `git push --delete origin ${ tags }`, projectPath );

}
