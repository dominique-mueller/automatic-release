/**
 * Git Conventional Commit interface
 */
export interface GitConventionalCommit {
	type?: string;
	scope?: string;
	message: string;
	body?: string;
	hash?: string;
}
