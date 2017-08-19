import { AutomaticReleaseInformation } from './src/interfaces/automatic-release-information.interface';
import { collectInformation } from './src/steps/information';
import { createAllGithubReleases } from './src/steps/github';
import { generateAndWriteChangelog } from './src/steps/changelog';
import { readFile } from './src/utilities/read-file';
import { saveChangesToGit } from './src/steps/git';
import { updatePackageJson } from './src/steps/package-json';

// TODO: Move to bin?
// TODO: Logging + time
// TODO: Clean process exit w/ code
async function main() {

	console.log( 'COLLECT INFO' );
	const information: AutomaticReleaseInformation = await collectInformation();
	console.log( information );

	console.log( 'PACKAGE FILE' );
	// await updatePackageJson( information.newVersion );

	console.log( 'CHANGELOG' );
	// await generateAndWriteChangelog( information.repositoryUrl );

	console.log( 'GIT' );
	// await saveChangesToGit( information.newVersion );

	console.log( 'GITHUB RELEASE' );
	// await createAllGithubReleases( information.repositoryOwner, information.repositoryName, information.githubToken );

}

main();
