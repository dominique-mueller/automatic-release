/**
 * Automatic Release Information Interface
 */
export interface AutomaticReleaseInformation {
	isFirstVersion?: boolean;
	newVersion?: string;
	oldVersion?: string;
	repositoryOwner?: string;
	repositoryName?: string;
	githubToken?: string;
}
