import * as childProcess from 'child_process';
import { promisify } from 'util';

const execAsync = promisify( childProcess.exec );

/**
 * Run CLI command
 *
 * @param   command     - Command
 * @param   projectPath - Project path
 * @returns             - Output
 */
export async function run( command: string, projectPath: string ): Promise<string> {
	return new Promise( async( resolve: ( output: string ) => void, reject: ( error: string ) => void ): Promise<void> => {

		// Run
		const { stdout, stderr } = await execAsync( command, {
			cwd: projectPath
		} );

		// Resolve
		if ( stderr !== '' && !command.startsWith( 'git' ) ) {
			console.error( stderr );
			reject( stderr );
		}
		resolve( stdout );

	} );
}
