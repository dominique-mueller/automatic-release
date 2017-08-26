import * as path from 'path';

import * as git from 'simple-git';

import { log } from './../log';
import { resolvePath } from './../utilities/resolve-path';

/**
 * Save all changes to Git
 *
 * @param   newVersion - New version
 * @returns            - Promise
 */
export function saveChangesToGit( newVersion: string ): Promise<void> {
	return new Promise<void>( ( resolve: () => void, reject: ( error: Error ) => void ) => {

		try {

			git()

				.exec( () => {
					log( 'substep', 'Commit all changes (CI will be skipped)' );
				} )

				// Stage changed files, then commit
				.add( resolvePath( 'package.json' ) )
				.add( resolvePath( 'CHANGELOG.md' ) )
				.commit( `Release ${ newVersion } [skip ci]` )

				.exec( () => {
					log( 'substep', 'Create a Git version tag' );
				} )

				// Create a tag
				.addAnnotatedTag( newVersion, `Release of version ${ newVersion }.` )

				.exec( () => {
					log( 'substep', 'Push both commit & tag to remote' );
				} )

				// Push to origin/master
				.push( 'origin', 'master', {
					'--follow-tags': null // 'null' means true / enabled
				} )

				.exec( () => {
					log( 'substep', 'Update develop branch with the latest master' );
				} )

				// Update the develop branch (and return back to master)
				.checkout( 'develop' )
				.mergeFromTo( 'master', 'develop' )
				.push( 'origin', 'develop' )
				.checkout( 'master' )

				// Continue
				.exec( () => {
					resolve();
				} );

		} catch ( error ) {
			reject( new Error( `An error occured while saving the changes to Git. [${ ( <Error> error ).message }]` ) );
			return;
		}

	} );
}
