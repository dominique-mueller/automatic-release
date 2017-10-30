import { GitConventionalCommit } from '../interfaces/git-conventional-commit.interface';

/**
 * Test changelog entry for change (commit)
 *
 * @param changelogContentLine - Changelog line / entry
 * @param commit               - Commit
 * @param repositoryUrl        - Repository URL
 */
export function testChangelogChange( changelogContentLine: string, commit: GitConventionalCommit, repositoryUrl: string ): void {

	const commitMessage: string = `* **${ commit.scope }:** ${ commit.message }`;
	const commitLink: string = `([${ commit.hash }](${ repositoryUrl }/commit/${ commit.hash }))`;

	expect( changelogContentLine ).toBe( `${ commitMessage } ${ commitLink }` );

}
