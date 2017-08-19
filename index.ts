import { collectInformation } from './src/steps/information';
import { generateAndWriteChangelog } from './src/steps/changelog';
import { updatePackageJson } from './src/steps/package-json';
import { saveChangesToGit } from './src/steps/git';
import { cleanAndCreateGithubReleases } from './src/steps/github';

import { readFile } from './src/utilities/read-file';

import { AutomaticReleaseInformation } from './src/interfaces/automatic-release-information.interface';

// TODO: Move to bin?
// TODO: Logging + time
// TODO: Clean process exit w/ code
async function main() {

	const information: AutomaticReleaseInformation = await collectInformation();
	console.log( information );

	// await updatePackageJson( details.newPackageJson );

	// await generateAndWriteChangelog( details.newPackageJson.repository.url );

	// await saveChangesToGit( details.version.new );

	// await cleanAndCreateGithubReleases( details.repository.owner, details.repository.name, details.githubToken );

}

main();
