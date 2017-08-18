import * as retrieveInformation from './src/steps/retrieve-information';

async function main() {

	const data: any = await retrieveInformation.retrieveInformation();
	// console.log( data );

}

main();
