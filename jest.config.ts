/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    // modify the (wasm-exported) js files to be able to run in jest
    '\\.js$': ['babel-jest', { configFile: './babel-jest.config.json' }],
  }
};