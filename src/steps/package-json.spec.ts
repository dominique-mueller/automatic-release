import { PackageJson } from "../interfaces/package-json.interface";
import { setupReadFileMock } from '../../test/read-file.mock';
import { setupWriteFileMock } from '../../test/write-file.mock';

/**
 * Update package.json file - Unit Test
 */
describe( '[STEP 2] Update "package.json" file', () => {

    beforeAll( () => {

        // Hide logging output
        jest.spyOn( console, 'log' ).mockImplementation( () => {
            return;
        } );

    } );

    beforeEach( () => {

        jest.resetModules();

    } );

    it ( 'should update the version within the "package.json" file', async() => {

        // Setup mocks & spies
        const readFileSpy = jest.fn();
        setupReadFileMock( getPackageJson( 'before' ), false, readFileSpy );
        const writeFileSpy = jest.fn();
        setupWriteFileMock( false, writeFileSpy );

        const updatePackageJson = await import( './package-json' );
        await updatePackageJson.updatePackageJson( getPackageJson( 'after' ).version );

        expect( readFileSpy ).toHaveBeenCalledWith( 'package.json', false );
        expect( writeFileSpy ).toHaveBeenCalledWith( 'package.json', getPackageJson( 'after' ), false );

    } );

    it ( 'should throw an error when reading the "package.json" file fails', async() => {

        // Setup mocks & spies
        const readFileSpy = jest.fn();
        setupReadFileMock( getPackageJson( 'before' ), true, readFileSpy );
        const writeFileSpy = jest.fn();
        setupWriteFileMock( false, writeFileSpy );

        const updatePackageJson = await import( './package-json' );
        let errorMessage: string | null = null;
        try {
            await updatePackageJson.updatePackageJson( getPackageJson( 'after' ).version );
        } catch( error ) {
            errorMessage = error.message;
        }

        expect( errorMessage ).toBe( 'An error occured.' );
        expect( readFileSpy ).toHaveBeenCalledWith( 'package.json', false );
        expect( writeFileSpy ).not.toHaveBeenCalled();

    } );

    it ( 'should throw an error when writing the updated "package.json" file fails', async() => {

        // Setup mocks & spies
        const readFileSpy = jest.fn();
        setupReadFileMock( getPackageJson( 'before' ), false, readFileSpy );
        const writeFileSpy = jest.fn();
        setupWriteFileMock( true, writeFileSpy );

        const updatePackageJson = await import( './package-json' );
        let errorMessage: string | null = null;
        try {
            await updatePackageJson.updatePackageJson( getPackageJson( 'after' ).version );
        } catch( error ) {
            errorMessage = error.message;
        }

        expect( errorMessage ).toBe( 'An error occured.' );
        expect( readFileSpy ).toHaveBeenCalledWith( 'package.json', false );
        expect( writeFileSpy ).toHaveBeenCalledWith( 'package.json', getPackageJson( 'after' ), false );

    } );

} );

/**
 * Get package JSON (separate objects for each test case)
 */
function getPackageJson( type: string ): PackageJson {

    switch ( type ) {

        case 'before':
            return {
                name: 'test-library',
                description: 'Lorem ipsum dolor sit amet.',
                version: '1.0.0',
                repository: {
                    "type": "git",
                    "url": "https://github.com/john-doe/test-library"
                }
            };

        case 'after':
            return {
                name: 'test-library',
                description: 'Lorem ipsum dolor sit amet.',
                version: '1.1.0',
                repository: {
                    "type": "git",
                    "url": "https://github.com/john-doe/test-library"
                }
            };


    }

}
