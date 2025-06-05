/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
    preset: 'ts-jest/presets/js-with-ts-esm',
    testEnvironment: 'node',
    extensionsToTreatAsEsm: ['.ts'],
    moduleFileExtensions: ['ts', 'js', 'json'],
    moduleNameMapper: {
        '^(\.{1,2}/.*)\.js$': '$1'
    },
    transform: {
        '^.+\.tsx?$': ['ts-jest', {
            useESM: true,
            isolatedModules: true
        }]
    },
    testMatch: ['**/tests/**/*.test.ts'],
    transformIgnorePatterns: [
        'node_modules/(?!.*\.mjs$)'
    ]
};