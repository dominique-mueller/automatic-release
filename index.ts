import * as chalk from 'chalk';
import * as figures from 'figures';

import { AutomaticReleaseInformation } from './src/interfaces/automatic-release-information.interface';
import { collectInformation } from './src/steps/information';
import { createAllGithubReleases } from './src/steps/github';
import { generateAndWriteChangelog } from './src/steps/changelog';
import { readFile } from './src/utilities/read-file';
import { saveChangesToGit } from './src/steps/git';
import { updatePackageJson } from './src/steps/package-json';

async function main() {

	console.log( '' );
	console.log( chalk.white.underline( 'Automatic Release' ) );
	console.log( '' );

	try {

		console.log( '  Collect information' );
		const info: AutomaticReleaseInformation = await collectInformation();

		console.log( '  Update "package.json" file' );
		// await updatePackageJson( info.newVersion );

		console.log( '  Generate "CHANGELOG.md" file' );
		// await generateAndWriteChangelog( info.repositoryUrl );

		console.log( '  Create Git version tag, save changes to Git, update Git remote' );
		// await saveChangesToGit( info.newVersion );

		console.log( '  Create GitHub release' );
		// await createAllGithubReleases( info.repositoryOwner, info.repositoryName, info.repositoryUrl, info.githubToken );

		console.log( '' );
		console.log( chalk.green( `Release of version ${ info.newVersion } successful.` ) );
		console.log( '' );

	} catch ( error ) {
		console.log( '>', 'ERROR:' );
		console.log( '>', ( <Error> error ).message );
		return;
	}

}

main();
