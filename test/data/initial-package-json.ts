import { PackageJson } from '../../src/interfaces/package-json.interface';

/**
 * Initial package JSON
 */
export const initialPackageJson: PackageJson = {
	name: 'automatic-release-test',
	description: 'Lorem ipsum dolor sit amet.',
	version: '1.0.0',
	repository: {
		type: 'git',
		url: 'https://github.com/dominique-mueller/automatic-release-test'
	}
};
