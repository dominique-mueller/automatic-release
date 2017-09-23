/**
 * Setup read file mock
 *
 * @param fileContent - File content to return
 * @param [spy]       - Spy
 */
export function setupReadFileMock( fileContent: any, shouldFailReading: boolean = false, spy?: any ): void {

	jest.doMock( '../src/utilities/read-file', () => {
		return {
			readFile: ( filePath: string, isWithinLibrary: boolean = false ) => {
				if ( spy ) {
					spy( filePath, isWithinLibrary );
				}
				if ( shouldFailReading ) {
					throw new Error( 'An error occured.' );
				} else {
					return fileContent;
				}
			}
		};
	} );

}
