export default {
  testEnvironment: 'node',
  transform: {},
  moduleFileExtensions: ['js', 'mjs'],
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  // CI specific settings - using --json --outputFile in CLI instead of reporter
  ...(process.env.CI && {
    coverageReporters: ['text', 'text-summary', 'json-summary'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
  }),
};
