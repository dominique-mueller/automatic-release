import * as path from 'path';

import * as git from 'simple-git';

import { resolvePath } from './../utilities/resolve-path';

/**
 * Save all changes to Git
 *
 * @param   newVersion - New version
 * @returns            - Promise
 */
export function saveChangesToGit( newVersion: string ): Promise<void> {
	return new Promise<void>( ( resolve: () => void, reject: ( error: Error ) => void ) => {

		git()

			// Stage changed files, then commit
			.add( resolvePath( 'package.json' ) )
			.add( resolvePath( 'CHANGELOG.md' ) )
			.commit( `Release ${ newVersion } [skip ci]` )

			// Create a tag
			.addAnnotatedTag( newVersion, `Release of version ${ newVersion }.` )

			// Push to origin/master
			.push( 'origin', 'master', {
				'--follow-tags': null // 'null' means true / enabled
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

	} );
}
