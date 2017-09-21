import { GitRemote } from '../src/interfaces/git-remote.interface';
import { GitTags } from '../src/interfaces/git-tags.interface';

/**
 * Setup simple git mock
 */
export function setupSimpleGitMock(
	shouldTagsFail: boolean = false,
	shouldGetRemotesFail: boolean = false,
	shouldGetRemotesByEmpty: boolean = false,
	initial: boolean = true
): void {

	jest.doMock( 'simple-git', () => {
		return ( basePath: string ) => {

			const api: any = {};

			if ( initial ) {

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

			} else {

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

			}

			api.getRemotes = ( verbose: boolean, callback: ( gitGetRemotesError: Error | null, gitRemotes: Array<GitRemote> ) => void ) => {
				if ( shouldGetRemotesFail ) {
					callback( new Error( 'An error occured.' ), null );
				} else if ( shouldGetRemotesByEmpty ) {
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

// export function setupSimpleGitMock( initial: boolean = true ): any {

// 	if ( initial ) {

// 		return jest.doMock( 'simple-git', () => {
// 			return ( basePath: string ) => {
// 				return {
// 					tags: ( callback: ( gitTagsError: Error | null, gitTags: GitTags ) => void ) => {
// 						callback( null, {
// 							latest: undefined,
// 							all: []
// 						} );
// 					}
// 				};
// 			};
// 		} );

// 	} else {

// 		return jest.doMock( 'simple-git', () => {
// 			return ( basePath: string ) => {
// 				return {
// 					tags: ( callback: ( gitTagsError: Error | null, gitTags: GitTags ) => void ) => {
// 						callback( null, {
// 							latest: '1.1.0',
// 							all: [
// 								'1.0.0',
// 								'1.0.1',
// 								'1.0.2',
// 								'1.1.0'
// 							]
// 						} );
// 					}
// 				};
// 			};
// 		} );

// 	}

// }
