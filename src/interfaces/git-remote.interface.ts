/**
 * Git Remote Interface
 */
export interface GitRemote {
	name: string;
	refs: {
		fetch?: string;
		push?: string;
	};
}
