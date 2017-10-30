import { PreparedCommit } from './prepared-commit.interface';

/**
 * Prepared commits, sorted by change type
 */
export interface PreparedCommits {
    major: Array<PreparedCommit>;
    minor: Array<PreparedCommit>;
    none: Array<PreparedCommit>;
    patch: Array<PreparedCommit>;
}
