module.exports = {
  // Test environment
  testEnvironment: "jsdom",

  // Test file patterns
  testMatch: ["**/tests/**/*.test.js", "**/?(*.)+(spec|test).js"],

  // Setup files
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],

  // Module paths
  moduleDirectories: ["node_modules", "src"],

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],

  // Files to collect coverage from
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/**/*.test.js",
    "!**/node_modules/**",
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Transform files
  transform: {
    "^.+\\.js$": "babel-jest",
  },

  // Module name mapping for CSS and assets
  moduleNameMapping: {
    "\\.(css|less|scss)$": "identity-obj-proxy",
    "\\.(png|jpg|jpeg|gif|svg)$": "<rootDir>/tests/__mocks__/fileMock.js",
  },

  // Global setup
  globals: {
    chrome: {},
  },

  // Test timeout
  testTimeout: 10000,

  // Verbose output
  verbose: true,
};
