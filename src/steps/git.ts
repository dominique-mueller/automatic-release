import * as path from 'path';

import * as git from 'simple-git';

export function saveChangesToGit( newVersion: string ): Promise<void> {
	return new Promise<void>( ( resolve: () => void, reject: ( error: Error ) => void ) => {

		git()

			// Stage changed files, then commit
			.add( path.resolve( process.cwd(), 'package.json' ) )
			.add( path.resolve( process.cwd(), 'CHANGELOG.md' ) )
			.commit( `Release ${ newVersion } [skip ci]` )

			// Create a tag
			.addAnnotatedTag( newVersion, `Release of version ${ newVersion }.` )

			// Push to origin/master
			.push( 'origin', 'master', {
				'--follow-tags': null // 'null' means enabled
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
