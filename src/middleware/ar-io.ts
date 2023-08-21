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
import express from 'express';

import type { StandaloneSqliteDatabase } from '../database/standalone-sqlite.js';
import type { TransactionFetcher } from '../workers/transaction-fetcher.js';
import type { ArweaveG8wayMiddleware } from './types.js';

export const createArIoCoreMiddleware: (coreDeps: {
  AR_IO_WALLET: string;
}) => ArweaveG8wayMiddleware =
  ({ AR_IO_WALLET }) =>
  async ({ addCapability }) => {
    await addCapability({ name: 'gateway-ar-core', version: '1.0.0' });

    return async (app) => {
      // Healthcheck
      app.get('/ar-io/healthcheck', (_req, res) => {
        const data = {
          uptime: process.uptime(),
          message: 'Welcome to the Permaweb.',
          date: new Date(),
        };

        res.status(200).send(data);
      });

      // ar.io network info
      app.get('/ar-io/info', (_req, res) => {
        res.status(200).send({
          wallet: AR_IO_WALLET,
        });
      });

      return app;
    };
  };

export const createArIoAdminMiddleware: (coreDeps: {
  db: StandaloneSqliteDatabase;
  prioritizedTxIds: Set<string>;
  txFetcher: TransactionFetcher;
  ADMIN_API_KEY: string;
}) => ArweaveG8wayMiddleware =
  ({ db, prioritizedTxIds, txFetcher, ADMIN_API_KEY }) =>
  async ({ addCapability }) => {
    await addCapability({ name: 'ar-io-admin', version: '1.0.0' });

    return async (app) => {
      // Only allow access to admin routes if the bearer token matches the admin api key
      app.use('/ar-io/admin', (req, res, next) => {
        if (req.headers.authorization === `Bearer ${ADMIN_API_KEY}`) {
          next();
        } else {
          res.status(401).send('Unauthorized');
        }
      });

      // Debug info (for internal use)
      app.get('/ar-io/admin/debug', async (_req, res) => {
        res.json({
          db: await db.getDebugInfo(),
        });
      });

      // Block access to contiguous data by ID or hash
      app.put('/ar-io/admin/block-data', express.json(), async (req, res) => {
        // TODO improve validation
        try {
          const { id, hash, source, notes } = req.body;
          if (id === undefined && hash === undefined) {
            res.status(400).send("Must provide 'id' or 'hash'");
            return;
          }
          db.blockData({ id, hash, source, notes });
          // TODO check return value
          res.json({ message: 'Content blocked' });
        } catch (error: any) {
          res.status(500).send(error?.message);
        }
      });

      // Queue a TX ID for processing
      app.post('/ar-io/admin/queue-tx', express.json(), async (req, res) => {
        try {
          const { id } = req.body;
          if (id === undefined) {
            res.status(400).send("Must provide 'id'");
            return;
          }
          prioritizedTxIds.add(id);
          txFetcher.queueTxId(id);
          res.json({ message: 'TX queued' });
        } catch (error: any) {
          res.status(500).send(error?.message);
        }
      });

      return app;
    };
  };
