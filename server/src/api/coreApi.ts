import { Express } from 'express';
import { Logger } from 'winston';
import Repository from '../db/repository';
import { catchErrors, userFromAuth, organizationFromReq } from './apiUtils';
import { existsSync, readFileSync } from 'fs';
import { SiteConfig } from '../../api-models/siteConfig';

export function addCoreApi(app: Express, repo: Repository, log: Logger) {
  app.get('/api/session', async (req, res) => {
    catchErrors(res, log, async () => {
      console.log(req, req.headers);

      if (!req.session?.auth && existsSync('local-auth.json')) {
        log.info('using debug login credentials in local-auth.json');
        req.session.auth = JSON.parse(readFileSync('local-auth.json', 'utf8'));
      }

      const org = await organizationFromReq(req, repo);
      let config :SiteConfig = {
        clientId: process.env.AUTH_CLIENT!,
      };
      if (org) {
        config = {
          ...config,
          organization: org ? {
            title: org.rosterName ?? org.title,
          } : undefined,
          brand: org?.brand,
        }
      }

      res.json({
        organization: await organizationFromReq(req, repo),
        config,
        user: userFromAuth(req.session.auth),
      });
    });
  });
}