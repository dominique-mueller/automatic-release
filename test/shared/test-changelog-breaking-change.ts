import { GitConventionalCommit } from '../interfaces/git-conventional-commit.interface';

/**
 * Test changelog entry for breaking change (commit)
 *
 * @param changelogContentLine - Changelog line / entry
 * @param commit               - Commit
 */
export function testChangelogBreakingChange( changelogContentLine: string, commit: GitConventionalCommit ): void {

	const commitMessage: string = `* **${ commit.scope }:** ${ commit.body.replace( 'BREAKING CHANGE: ', '' ) }`;

	expect( changelogContentLine ).toBe( commitMessage );

}
