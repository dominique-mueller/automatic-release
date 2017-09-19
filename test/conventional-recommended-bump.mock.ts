import { RecommendedBump } from '../src/interfaces/recommended-bump.interface';

/**
 * Mock conventional recommended bump
 */
export function setupConventionalRecommendedBumpMock(): void {

	jest.doMock( 'conventional-recommended-bump', () => {
		return ( options: any, callback: ( error: Error | null, recommendedBump: RecommendedBump ) => {} ) => {
			callback( null, {
				level: 1,
				reason: '',
				releaseType: 'patch' // This is the interesting part
			} );
		};
	} );

}
