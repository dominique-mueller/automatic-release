import { AutomaticReleaseInformation } from './src/interfaces/automatic-release-information.interface';
import { collectInformation } from './src/steps/information';
import { createAllGithubReleases } from './src/steps/github';
import { generateAndWriteChangelog } from './src/steps/changelog';
import { log } from './src/log';
import { readFile } from './src/utilities/read-file';
import { saveChangesToGit } from './src/steps/git';
import { updatePackageJson } from './src/steps/package-json';

async function main(): Promise<void> {
	return new Promise<void>( async( resolve: () => void, reject: ( error: Error ) => void ) => {

		log();
		log( 'title', 'AUTOMATIC RELEASE' );
		log();

		const startTime = new Date().getTime();

		try {

			log( 'step', 'Collect information' );
			log( 'substep', 'Read the "package.json" file' );
			log( 'substep', 'Validate & correct (if necessary) the "package.json" file' );
			log( 'substep', 'Write the "package.json" file' );
			log( 'substep', 'Retrieve versioning details' );
			log( 'substep', 'Get repository information' );
			log( 'substep', 'Read & validate GitHub API token' );
			const info: AutomaticReleaseInformation = await collectInformation();

			log();
			log( 'step', 'Update "package.json" file' );
			log( 'substep', 'Read the "package.json" file' );
			log( 'substep', 'Update the version number' );
			log( 'substep', 'Write the "package.json" file' );
			// await updatePackageJson( info.newVersion );

			log();
			log( 'step', 'Generate "CHANGELOG.md" file' );
			log( 'substep', 'Read changelog template files' );
			log( 'substep', 'Generage changelog' );
			log( 'substep', 'Write the "CHANGELOG.md" file' );
			// await generateAndWriteChangelog( info.repositoryUrl );

			log();
			log( 'step', 'Save changes to Git' );
			log( 'substep', 'Commit all changes (CI will be skipped)' );
			log( 'substep', 'Create an annotated Git version tag' );
			log( 'substep', 'Push both commit & tag to remote' );
			log( 'substep', 'Update develop branch with the latest master' );
			// await saveChangesToGit( info.newVersion );

			log();
			log( 'step', 'Create GitHub release' );
			log( 'substep', 'Delete all existing GitHub releases' );
			log( 'substep', 'Create all GitHub releases' );
			// await createAllGithubReleases( info.repositoryOwner, info.repositoryName, info.repositoryUrl, info.githubToken );

			const finishTime = new Date().getTime();
			const processTime = ( ( finishTime - startTime ) / 1000 ).toFixed( 2 );

			log();
			if ( info.isFirstVersion ) {
				log( 'success', `Release of version X.Y.Z successful (first release)! [${ processTime } seconds]` );
			} else {
				log( 'success', `Release of version X.Y.Z successful (previously X.Y.Z)! [${ processTime } seconds]` );
			}
			log();

			resolve();

		} catch ( error ) {

			log();
			log( 'error', ( <Error> error ).message );
			log();

			reject( error );

		}

	} );

}

main();
