/**
 * Setup read file mock
 *
 * @param fileContent - File content to return
 * @param [spy]       - Spy
 */
export function setupReadFileMock( fileContent: any, spy?: any ): void {

	jest.doMock( '../src/utilities/read-file', () => {
		return {
			readFile: ( filePath: string, isWithinLibrary: boolean = false ) => {
				if ( spy ) {
					spy( filePath, isWithinLibrary );
				}
				return fileContent;
			}
		};
	} );

}
