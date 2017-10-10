import * as request from 'request';

export function getGithubReleases() {
	return new Promise( async( resolve: ( releases: Array<any> ) => void, reject: ( error: string ) => void ): Promise<void> => {

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
