import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

import * as git from 'simple-git';
import { GitTags } from '../../src/interfaces/git-tags.interface';

const writeFileAsync = promisify( fs.writeFile );

/**
 * Initialize Git Repository
 */
export async function initGitRepository( projectPath: string, packageJsonContent: any ): Promise<void> {

	// Setup initial files
	await writeFileAsync( path.resolve( projectPath, 'README.md' ), '# README', 'utf-8' );
	await writeFileAsync( path.resolve( projectPath, 'package.json' ), JSON.stringify( packageJsonContent, null, '	' ), 'utf-8' );

	// Setup initial git repository (branches, first commit)
	await setupRepository( projectPath );

	// Delete all remote tags (locally none exist)
	const gitTags: Array<string> = await getGitTags( projectPath );
	if ( gitTags.length > 0 ) {
		await Promise.all(
			gitTags.map( async( gitTag: string ): Promise<void> => {
				await deleteGitTag( projectPath, gitTag );
			} )
		);
	}

}

function setupRepository( projectPath ): Promise<void> {
	return new Promise( ( resolve: () => void, reject: () => void ): void => {
		git( projectPath )
			.init()

			// Configuration
			.addConfig( 'user.name', 'Dominique Müller' )
			.addConfig( 'user.email', 'dominique.m.mueller@gmail.com' )
			.addConfig( 'commit.gpgsign', 'false' ) // Prevent popup window for GPG key
			.addRemote( 'origin', 'https://github.com/dominique-mueller/automatic-release-test' )

			// Initial commits
			.add( '.' )
			.commit( 'Initial commit' )
			.push( 'origin', 'master', { '--force': null } )
			.checkoutLocalBranch( 'develop' )
			.push( 'origin', 'develop', { '--force': null } )

			// Fetch remote tags
			.fetch( [
				'--tags'
			] )

			.exec( () => {
				resolve();
			} );
	} );
}

function getGitTags( projectPath: string ): Promise<Array<string>> {
	return new Promise( ( resolve: ( tags: Array<string> ) => void, reject: () => void ): void => {

		// Get all git tags
		git( projectPath )
			.tags( ( gitTagsError: Error | null, gitTags: GitTags ) => {

			resolve( gitTags.all );

		} );

	} );
}

function deleteGitTag( projectPath: string, gitTag: string ): Promise<void> {
	return new Promise( ( resolve: () => void, reject: () => void ): void => {

		// Get all git tags
		git( projectPath )
			.push( [
				'--delete',
				'origin',
				gitTag
			] )
			.exec( () => {
				resolve();
			} );

	} );
}
