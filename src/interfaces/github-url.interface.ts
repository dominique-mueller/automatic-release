import * as url from 'url';

/**
 * GitHub URL
 */
export interface GithubUrl extends url.Url {
	owner: string;
	name: string;
	repo: string;
	branch: string;
	repository: string;
}
