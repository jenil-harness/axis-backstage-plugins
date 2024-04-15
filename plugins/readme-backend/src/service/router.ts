import {
  errorHandler,
  TokenManager,
  UrlReader,
} from '@backstage/backend-common';
import { Config } from '@backstage/config';
import { CacheManager } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import { ScmIntegrations } from '@backstage/integration';
import {
  getEntitySourceLocation,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import { CatalogClient } from '@backstage/catalog-client';
import { DiscoveryApi } from '@backstage/plugin-permission-common';
import { isSymLink } from '../lib';

/**
 * Constructs a readme router.
 * @public
 */
export interface RouterOptions {
  /**
   * Implementation of Winston logger
   */
  logger: Logger;

  /**
   * Backstage config object
   */
  config: Config;

  /**
   * Backstage url reader instance
   */
  reader: UrlReader;

  /**
   * Backstage discovery api instance
   */
  discovery: DiscoveryApi;

  /**
   * Backstage token manager instance
   */
  tokenManager: TokenManager;
}

const DEFAULT_TTL = 1800 * 1000;

interface FileType {
  name: string;
  type: string;
}
interface ReadmeFile extends FileType {
  content: string;
}

const README_TYPES: FileType[] = [
  { name: 'README', type: 'text/plain' },
  { name: 'README.md', type: 'text/markdown' },
  { name: 'README.rst', type: 'text/plain' },
  { name: 'README.txt', type: 'text/plain' },
  { name: 'README.MD', type: 'text/markdown' },
];

/**
 * Constructs a readme router.
 *
 * @public
 */
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config, reader, discovery, tokenManager } = options;
  const catalogClient = new CatalogClient({ discoveryApi: discovery });

  const pluginCache = CacheManager.fromConfig(config).forPlugin('readme');
  const cache = pluginCache.getClient({ defaultTtl: DEFAULT_TTL });

  logger.info('Initializing readme backend');
  const integrations = ScmIntegrations.fromConfig(config);
  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    response.json({ status: 'ok' });
  });

  router.get('/:kind/:namespace/:name', async (request, response) => {
    const { kind, namespace, name } = request.params;
    const entityRef = stringifyEntityRef({ kind, namespace, name });
    const cacheDoc = (await cache.get(entityRef)) as ReadmeFile | undefined;

    if (cacheDoc) {
      logger.info(`Loading README for ${entityRef} from cache.`);
      response.type(cacheDoc.type);
      response.send(cacheDoc.content);
      return;
    }
    const { token } = await tokenManager.getToken();
    const entity = await catalogClient.getEntityByRef(entityRef, { token });
    if (!entity) {
      logger.info(`No integration found for ${entityRef}`);
      response
        .status(500)
        .json({ error: `No integration found for ${entityRef}` });
      return;
    }
    const source = getEntitySourceLocation(entity);

    if (!source || source.type !== 'url') {
      logger.info(`Not valid location for ${source.target}`);
      response.status(404).json({
        error: `Not valid location for ${source.target}`,
      });
      return;
    }
    const integration = integrations.byUrl(source.target);

    if (!integration) {
      logger.info(`No integration found for ${source.target}`);
      response
        .status(500)
        .json({ error: `No integration found for ${source.target}` });
      return;
    }

    for (const fileType of README_TYPES) {
      const url = integration.resolveUrl({
        url: fileType.name,
        base: source.target,
      });

      let content;

      try {
        logger.info(`Fetch README ${entityRef}: ${url}, ${fileType.type} `);
        response.type(fileType.type);

        const urlResponse = await reader.readUrl(url);
        content = (await urlResponse.buffer()).toString('utf-8');

        if (isSymLink(content)) {
          const symLinkUrl = integration.resolveUrl({
            url: content,
            base: source.target,
          });
          const symLinkUrlResponse = await reader.readUrl(symLinkUrl);
          content = (await symLinkUrlResponse.buffer()).toString('utf-8');
        }

        cache.set(entityRef, {
          name: fileType.name,
          type: fileType.type,
          content: content,
        });
        response.send(content);
        return;
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'NotFoundError') {
          // Try the next readme type
          continue;
        } else {
          response.status(500).json({
            error: `Readme failure: ${error}`,
          });
          break;
        }
      }
    }
    logger.info(`Readme not found for ${entityRef}`);
    response.status(404).json({
      error: 'Readme not found.',
    });
  });

  router.use(errorHandler());
  return router;
}
