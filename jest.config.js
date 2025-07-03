export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        module: 'es2022'
      }
    }]
  },
  moduleNameMapper: {
    '^(\\.\\.?/.*)\\.js$': '$1',
    '^#ansi-styles$': '<rootDir>/node_modules/chalk/source/vendor/ansi-styles/index.js',
    '^#supports-color$': '<rootDir>/node_modules/chalk/source/vendor/supports-color/index.js'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(chalk|ora|inquirer|commander|strip-ansi|ansi-regex|string-width|emoji-regex|p-limit|yocto-queue|ansi-styles|supports-color)/)'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};