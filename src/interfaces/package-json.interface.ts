/**
 * Package JSON interface
 */
export interface PackageJson {
	version?: string;
	repository?: {
		type?: string;
		url?: string;
	};
}
