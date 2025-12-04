export default {
  testEnvironment: 'node',
  transform: {},
  moduleFileExtensions: ['js', 'mjs'],
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  // CI specific settings
  ...(process.env.CI && {
    reporters: [
      'default',
      ['jest-json-reporter', { outputFile: 'test-results.json' }]
    ],
    coverageReporters: ['text', 'text-summary', 'json-summary'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
  }),
};
