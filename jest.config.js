module.exports = {
  preset: 'jest-preset-angular',
  transform: {
    '^.+\\.(ts|js|html)$': 'ts-jest',
  },
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js',
  ],
  moduleNameMapper: {
    '@app/(.*)': '<rootDir>/src/app/$1',
    //'\\.(jpg|jpeg|png)$': '<rootDir>/__mocks__/image.js',
    //'^@lib/(.*)$': '<rootDir>/src/lib/$1',
  },
  moduleFileExtensions: ['ts', 'html', 'js', 'json'],
  setupFilesAfterEnv: ['<rootDir>/src/jest.ts'],
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
};
