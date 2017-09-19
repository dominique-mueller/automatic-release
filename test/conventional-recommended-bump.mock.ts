import { RecommendedBump } from '../src/interfaces/recommended-bump.interface';

/**
 * Mock conventional recommended bump
 */
export function setupConventionalRecommendedBumpMock( shouldFail: boolean = false ): void {

	jest.doMock( 'conventional-recommended-bump', () => {
		return ( options: any, callback: ( error: Error | null, recommendedBump: RecommendedBump ) => {} ) => {
			if ( shouldFail ) {
				callback( new Error( 'An error occured.' ), null );
			} else {
				callback( null, {
					level: 1,
					reason: '',
					releaseType: 'patch' // This is the interesting part
				} );
			}
		};
	} );

}
