/**
 * AR.IO Gateway
 * Copyright (C) 2022-2023 Permanent Data Solutions, Inc. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { default as cors } from 'cors';
import express from 'express';
//import * as OpenApiValidator from 'express-openapi-validator';
import fs from 'node:fs';
import YAML from 'yaml';

import * as config from './config.js';
import log from './log.js';
import { addCapability } from './middleware/ANS-101.js';
import { createGatewayApiDocsMiddleware } from './middleware/api-docs.js';
import {
  createArIoAdminMiddleware,
  createArIoCoreMiddleware,
} from './middleware/ar-io.js';
import { createArnsMiddleware } from './middleware/arns.js';
import { createDataMiddleware } from './middleware/data.js';
import { createGraphQLMiddleware } from './middleware/graphql.js';
import { createMetricsMiddleware } from './middleware/metrics.js';
import { createSandboxMiddleware } from './middleware/sandbox.js';
import { ArweaveG8wayMiddleware } from './middleware/types.js';
import * as system from './system.js';

system.arweaveClient.refreshPeers();
system.blockImporter.start();
system.txRepairWorker.start();
system.bundleRepairWorker.start();

// HTTP server
const app = express();

// TODO get path relative to source file instead of cwd
//app.use(
//  OpenApiValidator.middleware({
//    apiSpec: './docs/openapi.yaml',
//    validateRequests: true, // (default)
//    validateResponses: true, // false by default
//  }),
//);

app.use(cors());

const coreG8wayMiddleware = [
  createMetricsMiddleware(),
  createArnsMiddleware({
    log,
    dataIndex: system.contiguousDataIndex,
    dataSource: system.contiguousDataSource,
    blockListValidator: system.blockListValidator,
    manifestPathResolver: system.manifestPathResolver,
    nameResolver: system.nameResolver,
  }),
  createSandboxMiddleware({
    rootHost: config.ARNS_ROOT_HOST,
    sandboxProtocol: config.SANDBOX_PROTOCOL,
  }),
  createGatewayApiDocsMiddleware({
    openapiDocument: YAML.parse(fs.readFileSync('docs/openapi.yaml', 'utf8')),
  }),
  // TODO: use config schema to parse config for correctness instead of trusting types.
  createArIoCoreMiddleware({ AR_IO_WALLET: config.AR_IO_WALLET as string }),
  createArIoAdminMiddleware({
    db: system.db,
    prioritizedTxIds: system.prioritizedTxIds,
    txFetcher: system.txFetcher,
    ADMIN_API_KEY: config.ADMIN_API_KEY,
  }),
  createGraphQLMiddleware(system),
  createDataMiddleware({
    log,
    dataIndex: system.contiguousDataIndex,
    dataSource: system.contiguousDataSource,
    blockListValidator: system.blockListValidator,
    manifestPathResolver: system.manifestPathResolver,
  }),
];

// TODO: implement dynamically importing middleware
const dynamicallyAddedG8wayMiddleware: Promise<ArweaveG8wayMiddleware>[] = [];

[...coreG8wayMiddleware]
  .reduce(
    ($app, middleware) =>
      middleware({ addCapability }).then(async (m) => m(await $app)),
    Promise.resolve(app),
  )
  .then((app) => {
    app.listen(config.PORT, () => log.info(`Listening on port ${config.PORT}`));
  });
