/**
 * Parse changelog content
 *
 * @param   changelog - Changelog content
 * @returns           - Changelog parts (header, content, footer)
 */
export function parseChangelog( changelog: string ): Array<Array<string>> {
	const changelogLines: Array<string> = changelog.split( /\r?\n/ );
	return [
		changelogLines.slice( 0, 6 ),
		changelogLines.slice( 6, -7 ),
		changelogLines.slice( -7 )
	];
}
