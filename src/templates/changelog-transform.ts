import { GitCommit, GitCommitNote, GitCommitReference } from './../interfaces/git-commit.interface';

/**
 * Changelog transformer, primarily enhancing the commit content text
 */
export function changelogTransformer( repositoryUrl: string ) {

	return ( commit: GitCommit ) => {

		commit.notes.forEach( ( note: GitCommitNote ) => {
			note.title = 'BREAKING CHANGES';
		} );

		// Get full commit type from shorthand notation
		switch( commit.type ) {
			case 'feat':
				commit.type = 'Features';
				break;
			case 'fix':
				commit.type = 'Bug Fixes';
				break;
			case 'perf':
				commit.type = 'Performance Improvements';
				break;
			case 'style':
				commit.type = 'Styles';
				break;
			case 'docs':
				commit.type = 'Documentation';
				break;
			case 'refactor':
				commit.type = 'Refactoring';
				break;
			case 'test':
				commit.type = 'Tests'
				break;
			case 'chore':
				commit.type = 'Chores';
				break;
			case 'revert':
				commit.type = 'Reverts';
				break;
			default:
				return; // Skip commits without commit message convention (e.g. release commits)
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
				.replace( /#([0-9]+)/g, function( match: string, issue: string ) {
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

		return commit;

	};

};
