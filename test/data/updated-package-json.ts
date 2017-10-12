import { PackageJson } from '../../src/interfaces/package-json.interface';

/**
 * Get updated package JSON
 */
export function getUpdatedPackageJson(): PackageJson {

	return {
		name: 'automatic-release-test',
		description: 'Lorem ipsum dolor sit amet.',
		version: '1.1.0',
		repository: {
			type: 'git',
			url: 'https://github.com/dominique-mueller/automatic-release-test'
		}
	};

}
