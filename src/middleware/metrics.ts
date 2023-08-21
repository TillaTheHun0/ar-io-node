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
import promMid from 'express-prometheus-middleware';

import type { ArweaveG8wayMiddleware } from './types.js';

export const createMetricsMiddleware: () => ArweaveG8wayMiddleware =
  () =>
  async ({ addCapability }) => {
    await addCapability({ name: 'gateway-metrics', version: '1.0.0' });

    return async (app) =>
      app.use(
        promMid({
          metricsPath: '/ar-io/__gateway_metrics',
          extraMasks: [
            // Mask all paths except for the ones below
            /^(?!api-docs)(?!ar-io)(?!graphql)(?!openapi\.json)(?!raw).+$/,
            // Mask Arweave TX IDs
            /[a-zA-Z0-9_-]{43}/,
          ],
        }),
      );
  };
