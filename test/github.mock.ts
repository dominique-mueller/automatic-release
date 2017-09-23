/**
 * Setup GitHub mock
 */
export function setupGithubMock( shouldGetCollaboratorsFail: boolean = false ): void {

	jest.doMock( 'github', () => {
		return function( options ) {
			return {
				authenticate: ( auth ) => {
					// Nothing to do
				},
				repos: {
					getCollaborators: ( params, callback: ( error: any | null, collaborators: any ) => void ) => {
						if ( shouldGetCollaboratorsFail ) {
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
