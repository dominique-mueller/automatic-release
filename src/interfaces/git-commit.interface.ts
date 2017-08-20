/**
 * Git Commit Interface
 */
export interface GitCommit {
	type: string;
	scope: string;
	subject: string;
	merge: null; // Not clear ...
	header: string;
	body: string | null;
	footer: string | null;
	notes: Array<GitCommitNote>;
	references: Array<GitCommitReference>;
	mentions: Array<string>;
	revert: null; // Not clear ...
	hash: string;
	gitTags: string;
	committerDate: string;
}

/**
 * Git Commit Reference
 */
export interface GitCommitReference {
	action: string;
	owner: string | null;
	repository: string | null;
	issue: string;
	raw: string;
	prefix: string;
}

/**
 * Git Commit Note
 */
export interface GitCommitNote {
	title: string;
	text: string;
}
