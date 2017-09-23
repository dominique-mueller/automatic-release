import * as fs from 'fs';
import * as path from 'path';

import * as del from 'del';
import * as git from 'simple-git';

describe( 'Automatic Release', () => {

    const projectPath: string = path.resolve( process.cwd(), 'dist-test' );

    // Setup
    beforeAll( async() => {

        await del( projectPath );
        fs.mkdirSync( projectPath );
        fs.writeFileSync( path.resolve( projectPath, 'package.json' ), JSON.stringify( {
            name: 'test-library',
            description: 'Lorem ipsum dolor sit amet.',
            version: '1.0.0',
            repository: {
                type: 'git',
                url: 'https://github.com/dominique-mueller/test-library'
            }
        }, null, '  ' ) );

    } );

    afterAll( () => {
    } );

    it ( 'should run through', () => {

        git( projectPath )
            .init()
            .addRemote( 'origin', 'https://github.com/dominique-mueller/automatic-release-test' );

    } );

} );
