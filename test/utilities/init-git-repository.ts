import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

import { run } from './run';
import { getGitTags } from './get-git-tags';

const writeFileAsync = promisify( fs.writeFile );

/**
 * Initialize Git Repository
 *
 * @param   projectPath        - Projcet path
 * @param   packageJsonContent - Package JSON
 */
export async function initGitRepository( projectPath: string, packageJsonContent: any ): Promise<void> {

	// Setup initial files
	await writeFileAsync( path.resolve( projectPath, 'README.md' ), '# README', 'utf-8' );
	await writeFileAsync( path.resolve( projectPath, 'package.json' ), JSON.stringify( packageJsonContent, null, '	' ), 'utf-8' );

	// Init git repository
	await run( 'git init', projectPath );
	await run( 'git config user.name Dominique Müller', projectPath );
	await run( 'git config user.email dominique.m.mueller@gmail.com', projectPath );
	await run( 'git config commit.gpgsign false', projectPath );
	await run( 'git remote add origin https://github.com/dominique-mueller/automatic-release-test', projectPath );

	// Initial commits
	await run( 'git add .', projectPath );
	await run( 'git commit -m "Initial commit"', projectPath );
	await run( 'git push origin master --force', projectPath );
	await run( 'git checkout -b develop', projectPath );
	await run( 'git push origin develop --force', projectPath );

	// Delete tags (on remote)
	await run( 'git fetch --tags', projectPath );
	const tags: Array<string> = await getGitTags( projectPath );
	await Promise.all(
		tags.map( async( tag: string ): Promise<void> => {
			await await run( `git tag --delete ${ tag }`, projectPath ); // Delete locally
			await await run( `git push --delete origin ${ tag }`, projectPath ); // Delete on remote
		} )
	);

}
