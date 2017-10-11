import * as request from 'request';

/**
 * Get GitHub releases
 *
 * @returns - List of GitHub releases
 */
export function getGithubReleases(): Promise<Array<GithubRelease>> {
	return new Promise( async( resolve: ( releases: Array<GithubRelease> ) => void, reject: ( error: string ) => void ): Promise<void> => {

		request.get( {
			url: 'https://api.github.com/repos/dominique-mueller/automatic-release-test/releases',
			headers: {
				'User-Agent': 'dominique-mueller'
			}
		}, ( error: string, response: any, body: string ) => {

			if ( error !== null ) {
				console.error( error );
				reject( error );
				return;
			}

			resolve( JSON.parse( body ) );

		} );

	} );
}

/**
 * GitHub Release Interface
 */
export interface GithubRelease {
	url: string;
	assets_url: string;
	upload_url: string;
	html_url: string;
	id: number;
	tag_name: string;
	target_commitish: string;
	name: string;
	draft: boolean;
	author: {
		login: string;
		id: number;
		avatar_url: string;
		gravatar_id: string;
		url: string;
		html_url: string;
		followers_url: string;
		following_url: string;
		gists_url: string;
		starred_url: string;
		subscriptions_url: string;
		organizations_url: string;
		repos_url: string;
		events_url: string;
		received_events_url: string;
		type: string;
		site_admin: boolean;
	},
	prerelease: boolean;
	created_at: string;
	published_at: string;
	assets: Array<any>,
	tarball_url: string;
	zipball_url: string;
	body: string;
}
