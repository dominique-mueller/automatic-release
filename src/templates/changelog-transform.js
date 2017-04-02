'use strict';

const path = require( 'path' );

const githubUrlFromGit = require( 'github-url-from-git' );

// Read package.json content initially
const pkgJson = require( path.resolve( process.cwd(), 'package.json' ) );

/**
 * Default export:
 * Transform function for the changelog generator.
 */
module.exports = function( commit ) {
	let issues = [];

	commit.notes.forEach( function( note ) {
		note.title = 'BREAKING CHANGES';
	} );

	if ( commit.type === 'feat' ) {
		commit.type = 'Features';
	} else if ( commit.type === 'fix' ) {
		commit.type = 'Bug Fixes';
	} else if ( commit.type === 'perf' ) {
		commit.type = 'Performance Improvements';
	} else if ( commit.type === 'revert' ) {
		commit.type = 'Reverts';
	} else if ( commit.type === 'docs' ) {
		commit.type = 'Documentation';
	} else if ( commit.type === 'style' ) {
		commit.type = 'Styles';
	} else if ( commit.type === 'refactor' ) {
		commit.type = 'Code Refactoring';
	} else if ( commit.type === 'test' ) {
		commit.type = 'Tests';
	} else if ( commit.type === 'chore' ) {
		commit.type = 'Chores';
	} else {
		return;
	}

	if ( commit.scope === '*' ) {
		commit.scope = '';
	}

	if ( typeof commit.hash === 'string' ) {
		commit.hash = commit.hash.substring( 0, 7 );
	}

	if ( typeof commit.subject === 'string' ) {

		// Get url to the github issues page
		const githubIssueUrl = `${ githubUrlFromGit( pkgJson.repository.url ) }/issues/`;
		commit.subject = commit.subject.replace( /#([0-9]+)/g, function( _, issue ) {
			issues.push( issue );
			return '[#' + issue + '](' + githubIssueUrl + issue + ')';
		} );
		commit.subject = commit.subject.replace( /@([a-zA-Z0-9_]+)/g, '[@$1](https://github.com/$1)' );
		commit.subject = commit.subject;

	}

	// remove references that already appear in the subject
	commit.references = commit.references.filter( ( reference ) => {
		return issues.indexOf( reference.issue ) === -1;
	} );

	return commit;

};
