import { run } from './run';

/**
 * Get git tags
 *
 * @param   projectPath - Project path
 * @returns             - List of git tags
 */
export async function getGitTags( projectPath: string ): Promise<Array<string>> {

	return ( await run( 'git tag', projectPath ) )
		.split( /\r?\n/ )
		.filter( ( tag: string ) => {
			return tag !== '';
		} );

}
