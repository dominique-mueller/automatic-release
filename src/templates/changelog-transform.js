'use strict';

const path = require( 'path' );

const parseGithubUrl = require( 'parse-github-url' );

// Read package.json content initially
const packageJsonFile = require( path.resolve( process.cwd(), 'package.json' ) );

/**
 * Default export:
 * Transform function for the changelog generator.
 */
module.exports = function( commit ) {

	commit.notes.forEach( function( note ) {
		note.title = 'BREAKING CHANGES';
	} );

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

	if ( commit.scope === '*' ) {
		commit.scope = '';
	}

	if ( typeof commit.hash === 'string' ) {
		commit.hash = commit.hash.substring( 0, 7 );
	}

	let issues = [];
	if ( typeof commit.subject === 'string' ) {

		// Get url to the github issues page
		const githubIssueUrl = `${ packageJsonFile.repository.url }/issues/`;
		commit.subject = commit.subject.replace( /#([0-9]+)/g, function( _, issue ) {
			issues.push( issue );
			return '[#' + issue + '](' + githubIssueUrl + issue + ')';
		} );
		commit.subject = commit.subject.replace( /@([a-zA-Z0-9_]+)/g, '[@$1](https://github.com/$1)' );
		commit.subject = commit.subject;

	}

	// Remove references that already appear in the subject
	commit.references = commit.references.filter( ( reference ) => {
		return issues.indexOf( reference.issue ) === -1;
	} );

	return commit;

};
