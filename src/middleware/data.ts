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
import { Logger } from 'winston';

import { createDataHandler, createRawDataHandler } from '../routes/data.js';
import type {
  BlockListValidator,
  ContiguousDataIndex,
  ContiguousDataSource,
  ManifestPathResolver,
} from '../types.js';
import type { ArweaveG8wayMiddleware } from './types.js';

const RAW_DATA_PATH_REGEX = /^\/raw\/([a-zA-Z0-9-_]{43})\/?$/i;
const DATA_PATH_REGEX =
  /^\/?([a-zA-Z0-9-_]{43})\/?$|^\/?([a-zA-Z0-9-_]{43})\/(.*)$/i;

export const createDataMiddleware: (coreDeps: {
  log: Logger;
  dataSource: ContiguousDataSource;
  dataIndex: ContiguousDataIndex;
  blockListValidator: BlockListValidator;
  manifestPathResolver: ManifestPathResolver;
}) => ArweaveG8wayMiddleware = ({
  log,
  dataSource,
  dataIndex,
  blockListValidator,
  manifestPathResolver,
}) => {
  return async ({ addCapability }) => {
    await addCapability({ name: 'arweave-id-lookup', version: '1.0.0' });

    return (app) => {
      app.get(
        RAW_DATA_PATH_REGEX,
        createRawDataHandler({
          log,
          dataIndex,
          dataSource,
          blockListValidator,
        }),
      );

      app.get(
        DATA_PATH_REGEX,
        createDataHandler({
          log,
          dataIndex,
          dataSource,
          blockListValidator,
          manifestPathResolver,
        }),
      );

      return app;
    };
  };
};
