import { GitConventionalCommit } from './git-conventional-commit.interface';

/**
 * Prepared commit
 */
export interface PreparedCommit {
    fileName: string;
    fileContent: string;
    commit: GitConventionalCommit;
}
