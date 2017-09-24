import * as fs from 'fs';
import * as path from 'path';

import * as git from 'simple-git';

/**
 * Initialize Git Repository
 */
export function initGitRepository( projectPath: string ): Promise<void> {
	return new Promise( ( resolve: () => void, reject: () => void ): void => {

		fs.writeFileSync( path.resolve( projectPath, 'README.md' ), '# README', 'utf-8' );

		git( projectPath )
			.init()
			.addConfig( 'user.name', 'Dominique Müller' )
			.addConfig( 'user.email', 'dominique.m.mueller@gmail.com' )
			.addConfig( 'commit.gpgsign', 'false' ) // Prevent popup window for GPG key
			.addRemote( 'origin', 'https://github.com/dominique-mueller/automatic-release-test' )
			.add( '.' )
			.commit( 'Initial commit' )
			.push( 'origin', 'master', { '--force': null } )
			.checkoutLocalBranch( 'develop' )
			.push( 'origin', 'develop', { '--force': null } )
			.exec( () => {
				resolve();
			} );

	} );
}
