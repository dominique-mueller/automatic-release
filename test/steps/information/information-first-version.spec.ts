import { collectInformation } from '../../../src/steps/information';

import * as conventionalRecommendedBump from 'conventional-recommended-bump';
import * as git from 'simple-git';
import * as GitHubApi from 'github';
import * as parseGithubUrl from 'parse-github-url';
import * as semver from 'semver';

import * as log from '../../../src/log';
import * as readFile from '../../../src/utilities/read-file';
import * as writeFile from '../../../src/utilities/write-file';
import { PackageJson } from '../../../src/interfaces/package-json.interface';
import { AutomaticReleaseInformation } from '../../../src/interfaces/automatic-release-information.interface';
import { GitTags } from '../../../src/interfaces/git-tags.interface';
import { RecommendedBump } from '../../../src/interfaces/recommended-bump.interface';

jest.mock( 'simple-git', () => {
	return ( basePath: string ) => {
		return {
			tags: ( callback: ( gitTagsError: Error | null, gitTags: GitTags ) => void ) => {
				callback( null, {
					latest: '1.1.0',
					all: [
						'1.0.0',
						'1.0.1',
						'1.0.2',
						'1.1.0'
					]
				} );
			}
		};
	};
} );

jest.mock( 'conventional-recommended-bump', () => {
	return ( options: any, callback: ( error: Error | null, recommendedBump: RecommendedBump ) => {} ) => {
		callback( null, {
			level: 1,
			reason: '',
			releaseType: 'patch' // This is the interesting part
		} );
	};
} );

jest.mock( 'github', () => {
	return function( options ) {
		return {
			authenticate: ( auth ) => {
				// Nothing to do
			},
			repos: {
				getCollaborators: ( params, callback: ( error: any | null, collaborators: any ) => void ) => {
					callback( null, {} );
				}
			}
		}
	}
} );

describe( 'Collect information', () => {

	beforeAll( () => {

		process.env.GH_TOKEN = 'ABCDE777';

		jest.spyOn( log, 'log' ).mockImplementation( () => {
			return;
		} );

		jest.spyOn( readFile, 'readFile' ).mockImplementation( () => {
			return validPackageJson;
		} );

		jest.spyOn( writeFile, 'writeFile' ).mockImplementation( () => {
			return;
		} );

	} );

	afterAll( () => {

		delete process.env.GH_TOKEN;

	} );

	it ( 'should run through successfully', ( done ) => {

		collectInformation()
			.then( ( information: AutomaticReleaseInformation ) => {

				expect( readFile.readFile ).toHaveBeenCalledWith( 'package.json' );
				expect( writeFile.writeFile ).toHaveBeenCalledWith( 'package.json', validPackageJson );

				expect( information.isFirstVersion ).toBe( false );
				expect( information.oldVersion ).toBe( '1.1.0' );
				expect( information.newVersion ).toBe( '1.1.1' );

				expect( information.repositoryOwner ).toBe( 'john-doe' );
				expect( information.repositoryName ).toBe( 'test-library' );
				expect( information.repositoryUrl ).toBe( 'https://github.com/john-doe/test-library' );

				expect( information.githubToken ).toBe( 'ABCDE777' );

				done();

			} );

	} );

} );

const validPackageJson: PackageJson = {
	name: 'test-library',
	description: 'Lorem ipsum dolor sit amet.',
	version: '1.1.0',
	repository: {
		"type": "git",
		"url": "https://github.com/john-doe/test-library"
	}
};
