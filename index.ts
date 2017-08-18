import { collectInformation, AutomaticReleaseInformation } from './src/steps/information';
import { generateAndWriteChangelog } from './src/steps/changelog';
import { updatePackageJson } from './src/steps/package-json';
import { saveChangesToGit } from './src/steps/git';
import { cleanAndCreateGithubReleases } from './src/steps/github';

// TODO: Move to bin?
// TODO: Logging + time
// TODO: Clean process exit w/ code
async function main() {

	// const details: AutomaticReleaseInformation = await collectInformation();
	// console.log( details );

	// await updatePackageJson( details.newPackageJson );

	// await generateAndWriteChangelog( details.newPackageJson.repository.url );

	// await saveChangesToGit( details.version.new );

	// await cleanAndCreateGithubReleases( details.repository.owner, details.repository.name, details.githubToken );

}

main();
