import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

import { getGitTags } from './../utilities/get-git-tags';
import { PackageJson } from '../../src/interfaces/package-json.interface';
import { run } from './../utilities/run';

const writeFileAsync = promisify( fs.writeFile );

/**
 * Initialize Git Repository; this includes:
 * - setting up a fresh local Git repository, connected to remote
 * - executing the first / initial commit (README and package.json)
 * - force pushed to GitHub remote, replacing whatever exists there
 * - cleaning up all tags, both locally and on remote
 *
 * @param projectPath - Project path
 * @param packageJson - Package JSON (both valid or invalid data is allowed)
 * @param useRemote   - Flag, describing whether to use the Git remote repository
 */
export async function setupGitRepository( projectPath: string,  useRemote: boolean, packageJson?: PackageJson ): Promise<void> {

	// Create initial files
	await writeFileAsync( path.resolve( projectPath, 'README.md' ), '# README', 'utf-8' );
	if ( packageJson ) {
		await writeFileAsync( path.resolve( projectPath, 'package.json' ), JSON.stringify( packageJson, null, '	' ), 'utf-8' );
	}

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
	if ( useRemote ) {
		await run( 'git push origin --all --force', projectPath );
	}

	// Delete tags
	if ( useRemote ) {
		await run( 'git fetch --tags', projectPath );
	}
	const tags: Array<string> = await getGitTags( projectPath );
	if ( tags.length > 0 ) {
		const stringifiedTags: string = tags.join( ' ' );
		await run( `git tag --delete ${ stringifiedTags }`, projectPath );
		if ( useRemote ) {
			await run( `git push --delete origin ${ stringifiedTags }`, projectPath );
		}
	}

}
