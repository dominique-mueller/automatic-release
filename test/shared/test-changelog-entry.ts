import { GitConventionalCommit } from '../utilities/init-git-commits';

/**
 * Test changelog entry (commit)
 *
 * @param changelogContentLine - Changelog line / entry
 * @param commit               - Commit
 * @param repositoryUrl        - Repository URL
 */
export function testChangelogEntry( changelogContentLine: string, commit: GitConventionalCommit, repositoryUrl: string ): void {

	const commitMessage: string = `* **${ commit.scope }:** ${ commit.message.split( '\n' )[ 0 ] }`;
	const commitLink: string = `([${ commit.hash }](${ repositoryUrl }/commit/${ commit.hash }))`;

	expect( changelogContentLine ).toBe( `${ commitMessage } ${ commitLink }` );

}
