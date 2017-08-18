import { information, AutomaticReleaseInformation } from './src/steps/information';
import { changelog } from './src/steps/changelog';
import { packageJson } from './src/steps/package-json';

async function main() {

	const details: AutomaticReleaseInformation = await information();
	console.log( details );

	// await packageJson( details.newPackageJson );

	// await changelog( details.newPackageJson.repository.url );

}

main();
