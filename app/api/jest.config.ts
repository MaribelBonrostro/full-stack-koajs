// eslint-disable-next-line node/no-unpublished-import
import type { Config } from 'jest';
// eslint-disable-next-line node/no-unpublished-import
import { pathsToModuleNameMapper } from 'ts-jest';

// eslint-disable-next-line node/no-unpublished-import
import baseConfig from '@nokkel/testing/dist/jest.config';

import { compilerOptions } from './tsconfig.json';

const config: Config = {
  ...baseConfig,
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
  modulePaths: [compilerOptions.baseUrl],
};

export default config;
