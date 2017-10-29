import { PreparedCommits } from '../interfaces/prepared-commits.interface';

/**
 * Prepared commits
 */
export const preparedCommits: PreparedCommits = {

    major: [
        {
            fileName: 'textarea.js',
            fileContent: '// Textarea',
            commit: {
                type: 'refactor',
                scope: 'textarea',
                message: 'Rename "showCounter" attribute to "counter"\n\nBREAKING CHANGE: The textarea "showCounter" attribute is now called "counter"'
            }
        }
    ],
    minor: [
        {
            fileName: 'input.js',
            fileContent: '// Input',
            commit: {
                type: 'feat',
                scope: 'input',
                message: 'Add input component\n\n- Add input component implementation\n- Add unit tests\n- Add documentation'
            }
        }
    ],
    none: [
        {
            fileName: 'CONTRIBUTORS.md',
            fileContent: '# Contributors',
            commit: {
                message: 'Add contributors file'
            }
        }
    ],
    patch: [
        {
            fileName: 'select.js',
            fileContent: '// Select',
            commit: {
                type: 'perf',
                scope: 'select',
                message: 'Improve rendering performance for select options loop'
            }
        }
    ]

}
