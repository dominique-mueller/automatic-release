/**
 * Test changelog footer
 *
 * @param changelogFooter - Changelog footer lines
 */
export function testChangelogFooter( changelogFooter: Array<string> ): void {

	expect( changelogFooter[ 0 ] ).toBe( '' );
	expect( changelogFooter[ 1 ] ).toBe( '<br>' );
	expect( changelogFooter[ 2 ] ).toBe( '' );
	expect( changelogFooter[ 3 ] ).toBe( '---' );
	expect( changelogFooter[ 4 ] ).toBe( '' );
	expect( changelogFooter[ 5 ] ).toBe( '<sup>*Changelog generated automatically by [automatic-release](https://github.com/dominique-mueller/automatic-release).*</sup>' );
	expect( changelogFooter[ 6 ] ).toBe( '' );

}
