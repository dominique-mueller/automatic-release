/**
 * Setup GitHub mock
 */
export function setupGithubMock( shouldFail: boolean = false ): void {

	jest.doMock( 'github', () => {
		return function( options ) {
			return {
				authenticate: ( auth ) => {
					// Nothing to do
				},
				repos: {
					getCollaborators: ( params, callback: ( error: any | null, collaborators: any ) => void ) => {
						if ( shouldFail ) {
							callback( {
								headers: {
									status: '500'
								},
								message: JSON.stringify( {
									message: 'An error occured.'
								} )
							}, null );
						} else {
							callback( null, {} );
						}
					}
				}
			}
		}
	} );

}
