import * as GitHubApi from 'github';

/**
 * Set GitHub default branch ()
 *
 * @param defaultBranch - Default branch
 */
export function setGithubDefaultBranch( defaultBranch: string ): Promise<void> {
    return new Promise( ( resolve: () => void, reject: ( error: string ) => void ): void => {

        // Create a github client, then authenticate
        const github = new GitHubApi( {
            timeout: 5000
        } );
        github.authenticate( {
            type: 'oauth',
            token: process.env.GH_TOKEN
        } );

        github.repos.edit( {
            owner: 'dominique-mueller',
            repo: 'automatic-release-test',
            name: 'automatic-release-test',
            default_branch: defaultBranch
        }, ( error: any | null, data: any ) => {

            if ( error ) {
                reject( error );
            }

            resolve();

        } );

    } );
}
