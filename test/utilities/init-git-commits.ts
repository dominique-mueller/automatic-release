import * as fs from 'fs';
import * as path from 'path';

import * as git from 'simple-git';

/**
 * Make Git Changes
 */
export function initGitCommits( projectPath: string, type: 'major' | 'minor' | 'patch' | 'none' ): Promise<void> {
	return new Promise( async( resolve: () => void, reject: () => void ): Promise<void> => {

		await commitForNone( projectPath );
		if ( type === 'patch' || type === 'minor' || type === 'major' ) {
			await commitForPatch( projectPath );
		}
		if ( type === 'minor' || type === 'major' ) {
			await commitForMinor( projectPath );
		}
		if ( type === 'major' ) {
			await commitForMajor( projectPath );
		}

		git( projectPath )
			.push( 'origin', 'develop' )
			.exec( () => {
				resolve();
			} );

	} );
}

/**
 * Commit for none
 */
function commitForNone( projectPath: string ): Promise<void> {
	return new Promise( ( resolve: () => void, reject: () => void ): void => {

		fs.writeFileSync( path.resolve( projectPath, 'CONTRIBUTORS.md' ), '# TODO', 'utf-8' );

		git( projectPath )
			.add( 'CONTRIBUTORS.md' )
			.commit( 'Add contributors file' )
			.exec( () => {
				resolve();
			} );

	} );
}

/**
 * Commit for path
 */
function commitForPatch( projectPath: string ): Promise<void> {
	return new Promise( ( resolve: () => void, reject: () => void ): void => {

		fs.writeFileSync( path.resolve( projectPath, 'select.js' ), '// Select', 'utf-8' );

		git( projectPath )
			.add( 'select.js' )
			.commit( 'perf(select): Improve rendering performance for select options loop' )
			.exec( () => {
				resolve();
			} );

	} );
}

/**
 * Commit for minor
 */
function commitForMinor( projectPath: string ): Promise<void> {
	return new Promise( ( resolve: () => void, reject: () => void ): void => {

		fs.writeFileSync( path.resolve( projectPath, 'input.js' ), '// Input', 'utf-8' );

		git( projectPath )
			.add( 'input.js' )
			.commit( 'feat(input): Add input component\n\n- Add input component implementation\n- Add unit tests\n- Add documentation' )
			.exec( () => {
				resolve();
			} );

	} );
}

/**
 * Commit for major
 */
function commitForMajor( projectPath: string ): Promise<void> {
	return new Promise( ( resolve: () => void, reject: () => void ): void => {

		fs.writeFileSync( path.resolve( projectPath, 'textarea.js' ), '// Textarea', 'utf-8' );

		git( projectPath )
			.add( 'textarea.js' )
			.commit( 'refactor(textarea): Rename "maxlength" attribute to "maxLength"\n\nBREAKING CHANGE: The textarea "maxlength" attribute is now called "maxLength"' )
			.exec( () => {
				resolve();
			} );

	} );
}
