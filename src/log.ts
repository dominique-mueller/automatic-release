import * as chalk from 'chalk';

// Different arrow symbol based on OS
const arrowSymbol = process.platform === 'win32' ? '→' : '➜';

/**
 * Logger
 *
 * @param [type='default'] - Log type
 * @param [message='']     - Log message
 */
export function log( type: 'title' | 'success' | 'error' | 'step' | 'substep' | 'default' = 'default', message: string = '' ): void {

	switch( type ) {

		case 'title':
			console.log( chalk.white.bold.underline( message ) );
			break;

		case 'success':
			console.log( chalk.green.bold( message ) );
			break;

		case 'error':
			console.log( chalk.red.bold( message ) );
			break;

		case 'step':
			console.log( chalk.white.bold( `  ${  message }` ) );
			break;

		case 'substep':
			console.log( chalk.gray( `    ${ arrowSymbol } ${  message }` ) );
			break;

		default:
			console.log( message );

	}

}
