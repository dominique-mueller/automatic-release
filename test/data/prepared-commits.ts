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
                message: 'Rename showCounter attribute to counter',
                body: 'BREAKING CHANGE: The textarea showCounter attribute is now called counter'
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
                message: 'Add input component'
            }
        },
        {
            fileName: 'checkbox.js',
            fileContent: '// Chckbox',
            commit: {
                type: 'feat',
                scope: 'checkbox',
                message: 'Add checkbox & checkbox group component'
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
        },
        {
            fileName: 'button.js',
            fileContent: '// Button',
            commit: {
                type: 'fix',
                scope: 'button',
                message: 'Add button type to prevent possible rendering issues'
            }
        }
    ]

};
