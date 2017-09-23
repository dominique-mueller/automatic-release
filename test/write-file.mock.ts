/**
 * Setup write file mock
 *
 * @param [spy] - Spy
 */
export function setupWriteFileMock( shouldFailWriting: boolean = false, spy?: any ): void {

	jest.doMock( '../src/utilities/write-file', () => {
		return {
			writeFile: ( filePath: string, fileContent: string | Object, isWithinLibrary: boolean = false ) => {
				if ( spy ) {
					spy( filePath, fileContent, isWithinLibrary );
				}
				if ( shouldFailWriting ) {
					throw new Error( 'An error occured.' );
				} else {
					return;
				}
			}
		};
	} );

}
