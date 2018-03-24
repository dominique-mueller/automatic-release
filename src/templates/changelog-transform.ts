import { GitCommit, GitCommitNote, GitCommitReference } from './../interfaces/git-commit.interface';

/**
 * Commit types with title
 */
export const commitTypes: { [ type: string ]: string } = {
	feat: 'Features',
	fix: 'Bug Fixes',
	style: 'Styles',
	perf: 'Performance Improvements',
	docs: 'Documentation',
	refactor: 'Refactoring',
	test: 'Tests',
	// chore: 'Chores', // Ignored because internal
	// build: 'Buid System', // Ignored because internal
	// ci: 'Continuous Integration', // Ignored because internal
	revert: 'Reverts'
};

/**
 * Ordered commit type titles, used for sorting (pre-calculated here for #perf reasons)
 */
export const commitTypesOrder: Array<string> = Object.values( commitTypes );

/**
 * Changelog transformer, primarily enhancing the commit content text
 */
export function changelogTransformer( repositoryUrl: string ) {

	return ( commit: GitCommit ) => {

		// Get full commit type from shorthand notation, skip if not defined (e.g. release commits)
		commit.type = commitTypes[ commit.type ];
		if ( !commit.type ) {
			return;
		}

		// Ommit the scope if there is none defined
		if ( commit.scope === '*' ) {
			commit.scope = '';
		}

		// Get short hash value
		if ( typeof commit.hash === 'string' ) {
			commit.hash = commit.hash.substring( 0, 7 );
		}

		// Add hyperlinks
		const issues: Array<string> = [];
		if ( typeof commit.subject === 'string' ) {

			commit.subject = commit.subject

				// Link issues (including PRs)
				.replace( /#([0-9]+)/g, function ( match: string, issue: string ) {
					issues.push( issue );
					return `[#${ issue }](${ repositoryUrl }/issues/${ issue })`;
				} )

				// Link users
				.replace( /@([a-zA-Z0-9_]+)/g, '[@$1](https://github.com/$1)' );

		}

		// Remove references that already appear in the subject
		commit.references = commit.references.filter( ( reference: GitCommitReference ) => {
			return issues.indexOf( reference.issue ) === -1;
		} );

		// Notes are always breaking changes
		commit.notes.forEach( ( note: GitCommitNote ) => {
			note.title = 'BREAKING CHANGES';
		} );

		return commit;

	};

};

/**
 * Changelog commit group sort function
 */
export function changelogCommitGroupsSort( a: any, b: any ) {
	return commitTypesOrder.indexOf( a.title ) > commitTypesOrder.indexOf( b.title );
};
