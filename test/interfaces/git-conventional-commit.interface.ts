/**
 * Git Conventional Commit interface
 */
export interface GitConventionalCommit {
	type?: string;
	scope?: string;
	message: string;
	hash?: string;
}
