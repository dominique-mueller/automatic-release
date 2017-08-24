import * as chalk from 'chalk';
import * as figures from 'figures';

import { AutomaticReleaseInformation } from './src/interfaces/automatic-release-information.interface';
import { collectInformation } from './src/steps/information';
import { createAllGithubReleases } from './src/steps/github';
import { generateAndWriteChangelog } from './src/steps/changelog';
import { readFile } from './src/utilities/read-file';
import { saveChangesToGit } from './src/steps/git';
import { updatePackageJson } from './src/steps/package-json';

async function main(): Promise<void> {
	return new Promise<void>( async( resolve: () => void, reject: ( error: Error ) => void ) => {

		console.log( '' );
		console.log( chalk.white.bold.underline( 'AUTOMATIC RELEASE' ) );

		const startTime = new Date().getTime();

		try {

			console.log( '' );
			console.log( chalk.bold( '  Collect information' ) );
			console.log( chalk.gray( `    ➜ Read the "package.json" file` ) );
			console.log( chalk.gray( `    ➜ Validate & correct (if necessary) the "package.json" file` ) );
			console.log( chalk.gray( `    ➜ Write the "package.json" file` ) );
			console.log( chalk.gray( `    ➜ Retrieve versioning details` ) );
			console.log( chalk.gray( `    ➜ Get repository information` ) );
			console.log( chalk.gray( `    ➜ Read & validate GitHub API token` ) );
			const info: AutomaticReleaseInformation = await collectInformation();

			console.log( '' );
			console.log( chalk.bold( '  Update "package.json" file' ) );
			console.log( chalk.gray( `    ➜ Read the "package.json" file` ) );
			console.log( chalk.gray( `    ➜ Update the version number` ) );
			console.log( chalk.gray( `    ➜ Write the "package.json" file` ) );
			// await updatePackageJson( info.newVersion );

			console.log( '' );
			console.log( chalk.bold( '  Generate "CHANGELOG.md" file' ) );
			console.log( chalk.gray( `    ➜ Read changelog template files` ) );
			console.log( chalk.gray( `    ➜ Generage changelog` ) );
			console.log( chalk.gray( `    ➜ Write the "CHANGELOG.md" file` ) );
			// await generateAndWriteChangelog( info.repositoryUrl );

			console.log( '' );
			console.log( chalk.bold( '  Save changes to Git' ) );
			console.log( chalk.gray( `    ➜ Commit all changes (CI will be skipped)` ) );
			console.log( chalk.gray( `    ➜ Create an annotated Git version tag` ) );
			console.log( chalk.gray( `    ➜ Push both commit & tag to remote` ) );
			console.log( chalk.gray( `    ➜ Update develop branch with the latest master` ) );
			// await saveChangesToGit( info.newVersion );

			console.log( '' );
			console.log( chalk.bold( '  Create GitHub release' ) );
			console.log( chalk.gray( `    ➜ Delete all existing GitHub releases` ) );
			console.log( chalk.gray( `    ➜ Create all GitHub releases` ) );
			// await createAllGithubReleases( info.repositoryOwner, info.repositoryName, info.repositoryUrl, info.githubToken );

			const finishTime = new Date().getTime();
			const processTime = ( ( finishTime - startTime ) / 1000 ).toFixed( 2 );

			console.log( '' );
			if ( info.isFirstVersion ) {
				console.log( chalk.bold.green( `Release of version X.Y.Z successful (first release)! [${ processTime } seconds]` ) );
			} else {
				console.log( chalk.bold.green( `Release of version X.Y.Z successful (previously X.Y.Z)! [${ processTime } seconds]` ) );
			}

			resolve();

		} catch ( error ) {

			console.log( '' );
			console.log( chalk.bold.red( ( <Error> error ).message ) );

			reject( error );

		}

	} );

}

main();
