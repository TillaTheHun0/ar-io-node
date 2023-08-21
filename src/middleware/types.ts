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
import type { Express } from 'express';

type JSONValue =
  | string
  | number
  | boolean
  | { [x: string]: JSONValue }
  | Array<JSONValue>;

export type ArweaveG8wayCapability<
  C extends Record<string, JSONValue> = Record<string, JSONValue>,
> = C & { name: string; version: string };

export type ArweaveG8wayMiddlewareContext = {
  addCapability: <C extends ArweaveG8wayCapability>(
    capability: C,
  ) => Promise<void>;
};

export type ArweaveG8wayMiddleware = (
  context: ArweaveG8wayMiddlewareContext,
) => Promise<(app: Express) => Express | Promise<Express>>;
