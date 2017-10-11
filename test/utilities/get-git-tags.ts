import { run } from "./run";

/**
 * Get git tags
 */
export async function getGitTags( projectPath: string ): Promise<Array<string>> {

	return ( await run( 'git tag', projectPath ) )
		.split( /\r?\n/ )
		.filter( ( tag: string ) => {
			return tag !== '';
		} );

}
