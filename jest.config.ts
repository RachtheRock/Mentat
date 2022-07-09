import type { Config } from '@jest/types';
import * as _ from 'lodash';


// Sync object
const config: Config.InitialOptions = {
  globals: {
    '_': _
  },
  preset: 'ts-jest',
  verbose: true,
  moduleFileExtensions: ["ts", "js"],
  moduleDirectories: [
    "node_modules",
    "src"
  ]
};
export default config;

// Or async function
// export default async (): Promise<Config.InitialOptions> => {
//   return {
//     verbose: true,
//   };
// };
