/**
 * Test changelog header
 *
 * @param changelogHeader - Changelog header lines
 * @param repositoryUrl   - Repository URL
 */
export function testChangelogHeader( changelogHeader: Array<string>, repositoryUrl: string ): void {

	expect( changelogHeader[ 0 ] ).toBe( '# Changelog' );
	expect( changelogHeader[ 1 ] ).toBe( '' );
	expect( changelogHeader[ 2 ] ).toBe( `Also see the **[release page](${ repositoryUrl }/releases)**.` );
	expect( changelogHeader[ 3 ] ).toBe( '' );
	expect( changelogHeader[ 4 ] ).toBe( '<br>' );
	expect( changelogHeader[ 5 ] ).toBe( '' );

}
