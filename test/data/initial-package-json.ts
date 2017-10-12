import { PackageJson } from '../../src/interfaces/package-json.interface';

/**
 * Get initial package JSON
 */
export function getInitialPackageJson(): PackageJson {

	return {
		name: 'automatic-release-test',
		description: 'Lorem ipsum dolor sit amet.',
		version: '1.0.0',
		repository: {
			type: 'git',
			url: 'https://github.com/dominique-mueller/automatic-release-test'
		}
	};

}
