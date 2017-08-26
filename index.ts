import { AutomaticReleaseInformation } from './src/interfaces/automatic-release-information.interface';
import { collectInformation } from './src/steps/information';
import { createAllGithubReleases } from './src/steps/github';
import { generateAndWriteChangelog } from './src/steps/changelog';
import { log } from './src/log';
import { readFile } from './src/utilities/read-file';
import { saveChangesToGit } from './src/steps/git';
import { updatePackageJson } from './src/steps/package-json';

async function automaticRelease(): Promise<void> {
	return new Promise<void>( async( resolve: () => void, reject: ( error: Error ) => void ) => {

		log();
		log( 'title', 'AUTOMATIC RELEASE' );
		log();

		const startTime = new Date().getTime();

		try {

			log( 'step', 'Collect information' );
			const info: AutomaticReleaseInformation = await collectInformation();

			log();
			log( 'step', 'Update "package.json" file' );
			await updatePackageJson( info.newVersion );

			log();
			log( 'step', 'Generate "CHANGELOG.md" file' );
			await generateAndWriteChangelog( info.repositoryUrl );

			log();
			log( 'step', 'Save changes to Git' );
			await saveChangesToGit( info.newVersion );

			log();
			log( 'step', 'Create GitHub release' );
			await createAllGithubReleases( info.repositoryOwner, info.repositoryName, info.repositoryUrl, info.githubToken );

			const finishTime = new Date().getTime();
			const processTime = ( ( finishTime - startTime ) / 1000 ).toFixed( 2 );

			log();
			if ( info.isFirstVersion ) {
				log( 'success', `Release of version ${ info.newVersion } successful (first release)! [${ processTime } seconds]` );
			} else {
				log( 'success', `Release of version ${ info.newVersion } successful (previously ${ info.oldVersion })! [${ processTime } seconds]` );
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
