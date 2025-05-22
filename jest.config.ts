export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>'],
    testMatch: ['**/?(*.)+(spec|test).ts'],
    moduleFileExtensions: ['ts', 'js', 'json'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
};