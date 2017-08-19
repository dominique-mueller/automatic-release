/**
 * Recommended Bump Interface
 */
export interface RecommendedBump {
	level: number;
	reason: string;
	releaseType: 'major' | 'minor' | 'patch';
}
