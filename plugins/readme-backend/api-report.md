## API Report File for "@axis-backstage/plugin-readme-backend"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts
import { BackendFeature } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { DiscoveryApi } from '@backstage/plugin-permission-common';
import express from 'express';
import { Logger } from 'winston';
import { TokenManager } from '@backstage/backend-common';
import { UrlReader } from '@backstage/backend-common';

// @public
export function createRouter(options: RouterOptions): Promise<express.Router>;

// @public
const readmePlugin: () => BackendFeature;
export default readmePlugin;

// @public
export interface RouterOptions {
  config: Config;
  discovery: DiscoveryApi;
  logger: Logger;
  reader: UrlReader;
  tokenManager: TokenManager;
}
```