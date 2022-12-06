import { Express, Request, Response } from 'express';
import { Logger } from 'winston';
import Repository from '../db/repository';
import D4HMembersProvider from '../memberProviders/d4hMembersProvider';
import { defaultMembersRepositoryRegistry } from '../memberProviders/memberProvider';
import Organization from '../model/organization';
import { catchErrors } from './apiUtils';

function assertAdminAndCatchErrors(req: Request, res: Response, log: Logger, body: () => Promise<void>) {
  if (!req.session?.auth?.isSiteAdmin) {
    res.status(403).json({error: "Permission denied"});
    return;
  }

  catchErrors(res, log, body);
}

export function addSiteAdminApi(app: Express, repo: Repository, log: Logger) {
  app.get('/api/site-admin/organizations', async (req, res) => {
    assertAdminAndCatchErrors(req, res, log, async() => {
      const orgRows = await repo.organizations.getAll();

      // Don't include the site-admins group (id=1) in this list.
      res.json({
        list: orgRows.filter(f => f.id > 1),
      });
    });
  });

  app.get('/api/site-admin/organizations/:orgId', async (req, res) => {
    assertAdminAndCatchErrors(req, res, log, async() => {
      const org = await repo.organizations.get(parseInt(req.params.orgId));

      res.json(org);
    });
  });

  app.post('/api/site-admin/organizations/:orgId', async (req, res) => {
    assertAdminAndCatchErrors(req, res, log, async() => {
      const updated = Object.assign(
        new Organization(),
        req.body,
      )
      const org = await repo.organizations.save(updated);
      res.json(org);
    });
  });

  app.get('/api/site-admin/refresh-d4h', async (req, res) => {
    catchErrors(res, log, async () => {
      res.json((await defaultMembersRepositoryRegistry.get('D4HMembers') as D4HMembersProvider).refresh());
    })
  })
}