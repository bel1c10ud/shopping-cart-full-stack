module.exports = {
  testEnvironment: '<rootDir>/src/testEnvironment.cjs',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  transform: {
    '^.+\\.[cm]?[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@mswjs/interceptors|rettime|until-async)/)',
  ],
  watchman: false,
};
