import * as child_process from 'child_process';

/**
 * Setup mocks
 *
 * @param projectPath - Project path
 */
export function setupMocks( projectPath: string ): void {

	jest.resetModules();

	jest.doMock( 'child_process', () => {
		return {

			// Switch the working directory (used by 'git-raw-commits')
			execFile: ( fileName: string, args: Array<string>, options: child_process.ExecFileOptions = {} ): child_process.ChildProcess => {
				const newOptions: child_process.ExecFileOptions = Object.assign( options, {
					cwd: projectPath
				} );
				return child_process.execFile( fileName, args, newOptions );
			},

			// Switch the working directory (used by 'git-semver-tags' and 'simple-git')
			exec: ( command: string, options: child_process.ExecOptions = {},
				callback?: ( error: Error, stdout: Buffer, stderr: Buffer ) => void ): child_process.ChildProcess => {
				const newOptions: child_process.ExecOptions = Object.assign( options, {
					cwd: projectPath
				} );
				return child_process.exec( command, newOptions, callback );
			},

			// Simply forward (used by 'simple-git')
			spawn: child_process.spawn

		}
	} );

	// Hide logging output
	jest.spyOn( console, 'log' ).mockImplementation( () => {
		return;
	} );

}
