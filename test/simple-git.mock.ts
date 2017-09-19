import { GitTags } from '../src/interfaces/git-tags.interface';

/**
 * Setup simple git mock
 *
 * @param [initial=true] - Flag, describing whether to mock a git repository with or without tags
 */
export function setupSimpleGitMock( initial: boolean = true ): void {

	jest.doMock( 'simple-git', () => {
		return ( basePath: string ) => {

			if ( initial ) {

				return {
					tags: ( callback: ( gitTagsError: Error | null, gitTags: GitTags ) => void ) => {
						callback( null, {
							latest: undefined,
							all: []
						} );
					}
				};

			} else {

				return {
					tags: ( callback: ( gitTagsError: Error | null, gitTags: GitTags ) => void ) => {
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
				};

			}


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
