import type { Config } from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
  preset: 'ts-jest',
  verbose: true,
  moduleFileExtensions: ["ts", "js"],
  moduleDirectories: [
    "node_modules",
    "src"
  ]
};
export default config;
