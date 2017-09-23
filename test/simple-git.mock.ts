import { GitRemote } from '../src/interfaces/git-remote.interface';
import { GitTags } from '../src/interfaces/git-tags.interface';

/**
 * Setup simple git mock
 *
 * @param [shouldTagsFail=false]          - Flag, describing whether getting tags should fail
 * @param [shouldGetRemotesFail=false]    - Flag, describing whether getting remotes should fail
 * @param [shouldGetRemotesBeEmpty=false] - Flag, describing whether the list of remotes should be empty
 * @param [initial=true]                  - Flag, describing whether the mock should return tags or not
 */
export function setupSimpleGitMock(
	shouldTagsFail: boolean = false,
	shouldGetRemotesFail: boolean = false,
	shouldGetRemotesBeEmpty: boolean = false,
	hasTags: boolean = true
): void {

	jest.doMock( 'simple-git', () => {
		return ( basePath: string ) => {

			const api: any = {};

			if ( hasTags ) {

				api.tags = ( callback: ( gitTagsError: Error | null, gitTags: GitTags ) => void ) => {
					if ( shouldTagsFail ) {
						callback( new Error( 'An error occured.' ), null );
					} else {
						callback( null, {
							latest: '1.1.0',
							all: [
								'1.0.0',
								'1.0.1',
								'1.0.2',
								'1.1.0'
							]
						} );
					}
				}

			} else {

				api.tags = ( callback: ( gitTagsError: Error | null, gitTags: GitTags ) => void ) => {
					if ( shouldTagsFail ) {
						callback( new Error( 'An error occured.' ), null );
					} else {
						callback( null, {
							latest: undefined,
							all: []
						} );
					}
				}

			}

			api.getRemotes = ( verbose: boolean, callback: ( gitGetRemotesError: Error | null, gitRemotes: Array<GitRemote> ) => void ) => {
				if ( shouldGetRemotesFail ) {
					callback( new Error( 'An error occured.' ), null );
				} else if ( shouldGetRemotesBeEmpty ) {
					callback( null, [ {
						name: '',
						refs: {}
					} ] );
				} else {
					callback( null, [ {
						name: 'origin',
						refs: {
							fetch: 'https://github.com/john-doe/test-library',
							push: 'https://github.com/john-doe/test-library'
						}
					} ] );

				}
			}

			return api;

		};
	} );

}
