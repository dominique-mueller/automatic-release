/**
 * Setup GitHub mock
 */
export function setupGithubMock(): void {

	jest.doMock( 'github', () => {
		return function( options ) {
			return {
				authenticate: ( auth ) => {
					// Nothing to do
				},
				repos: {
					getCollaborators: ( params, callback: ( error: any | null, collaborators: any ) => void ) => {
						callback( null, {} );
					}
				}
			}
		}
	} );

}
