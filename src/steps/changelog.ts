import * as path from 'path';
import * as stream from 'stream';

import * as getStream from 'get-stream';
import * as conventionalChangelog from 'conventional-changelog';

import { changelogTransformer, changelogCommitGroupsSort } from './../templates/changelog-transform';
import { log } from './../log';
import { readFile } from './../utilities/read-file';
import { writeFile } from './../utilities/write-file';

export class ChangelogGenerator {

	/**
	 * Generate and write the changelog
	 * Important: The package.json file has to be updated before this runs, otherwhise the new version will be ignored!
	 *
	 * @param   repositoryUrl - Repository URL
	 * @returns               - Promise
	 */
	public async generateAndWriteChangelog( repositoryUrl: string ): Promise<void> {

		log( 'substep', 'Generage changelog' );
		const changelog: string = await this.generateChangelogContent( repositoryUrl );

		log( 'substep', 'Write the "CHANGELOG.md" file' );
		await writeFile( 'CHANGELOG.md', changelog );

	}

	/**
	 * Generate the changelog
	 *
	 * @param   repositoryUrl      - Repository URL
	 * @returns                    - Promise, resolves with changelog
	 */
	private async generateChangelogContent( repositoryUrl: string ): Promise<string> {
		return new Promise<string>( async ( resolve: ( changelogContent: string ) => void, reject: ( error: Error ) => void ) => {

			const changelogHeader: string = `# Changelog\n\nAlso see the **[release page](${ repositoryUrl }/releases)**.\n`;
			const changelogFooter: string = '\n<br>\n\n---\n\n<sup>*Changelog generated automatically by [automatic-release](https://github.com/dominique-mueller/automatic-release).*</sup>\n';
			const changelogBody: string = await getStream(
				conventionalChangelog( {
					pkg: {
						path: path.resolve( process.cwd(), 'package.json' )
					},
					preset: 'angular',
					releaseCount: 0 // Regenerate the whole thing every time
				}, {
					linkCompare: false // We use a custom link
				}, {}, {}, {
					commitGroupsSort: changelogCommitGroupsSort,
					commitPartial: await readFile( `./../templates/changelog-commit.hbs`, true ),
					footerPartial: await await readFile( `./../templates/changelog-footer.hbs`, true ),
					headerPartial: await await readFile( `./../templates/changelog-header.hbs`, true ),
					mainTemplate: await await readFile( `./../templates/changelog-main.hbs`, true ),
					transform: changelogTransformer( repositoryUrl ) // Custom transform
				} )
			);

			const changelog: string = `${ changelogHeader }${ changelogBody }${ changelogFooter }`;
			resolve( changelog );

		} );
	}

}
