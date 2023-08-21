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
import type {
  ArweaveG8wayMiddleware,
  ArweaveG8wayMiddlewareContext,
} from './types.js';

const capabilities: { name: string }[] = [];

/**
 * Can be instantiated and then injected to add capabilities
 */
export const addCapability: ArweaveG8wayMiddlewareContext['addCapability'] =
  async (capability) => {
    const found = capabilities.find((c) => c.name === capability.name);

    if (found)
      throw new Error(
        `Multiple middleware implementing the ${capability.name} capability`,
      );

    capabilities.push(capability);
  };

/**
 * An Arweave G8way Middleware that exposes an implementation of ANS-101
 *
 * See https://specs.g8way.io/?tx=hLSKTSwd5_3xB71zciyK_WFEpK9wVX2IeGzxk9Yl2xY
 */
export const createCapabilitiesMiddleware: () => ArweaveG8wayMiddleware =
  () =>
  async ({ addCapability }) => {
    await addCapability({ name: 'reflexive', version: '1.0.0' });

    return async (app) =>
      app.get('/info/capabilities', (_req, res) => res.json({ capabilities }));
  };
