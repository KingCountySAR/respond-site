import { Express } from 'express';
import { Logger } from 'winston';
import Repository from '../db/repository';
import { catchErrors, userFromAuth, organizationFromReq, expandProperties, pick } from './apiUtils';
import { existsSync, readFileSync } from 'fs';
import { SiteConfig } from '../../api-models/siteConfig';
import Responder from '../model/responder';
import { OrgActivityModel } from '../../api-models/activityModel';

export function addCoreApi(app: Express, repo: Repository, log: Logger) {
  app.get('/api/session', async (req, res) => {
    catchErrors(res, log, async () => {
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
            id: org.id,
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

  app.get('/api/organizations/:organizationId/activities', async (req, res) => {
    catchErrors(res, log, async() => {
      const organization = await organizationFromReq(req, repo);
      if (!organization) {
        log.info(`Can't find organization ${req.params.organizationId}}`);
        res.status(404).json({error: 'Organization not found'});
        return;
      }

      const activities = await repo.activities.getCurrentForOrg(parseInt(req.params.organizationId));
      
      const withRosters :OrgActivityModel[] = await Promise.all(
        activities.map(async a => ({
          ...pick(expandProperties<any>(a),[
            'id',
            'idNumber',
            'title',
            'isOpen',
            'isMission',
            'startTime',
            'joinTime',
            'totalResponders',
            'activeResponders',
            'unitResponders',
            'activeUnitResponders',
          ]),
          organization: pick((await repo.organizations.get(a.organizationId))!, ['id', 'title', 'rosterName']),
          roster: await Promise.all((await repo.activities.getResponders(a.id))
                    .map(async r => ({
                      ...pick(expandProperties<Responder>(r), [
                        'name',
                        'idNumber',
                        'joinTime',
                        'endTime',
                        'status',
                    ]),
                    organization: pick((await repo.organizations.get(r.organizationId))!, ['id', 'rosterName']),
                  })))
          }))
      );
      
      res.json({
        list: withRosters
      })
    });
  });

  app.get('/api/main/mystatus', async (req, res) => {
    const userId = req.session?.auth?.userId;
    if (!userId) {
      res.status(401).json({error: 'Login required'});
      return;
    }
    const rows = await repo.activities.getMyActivities(userId);

    const activities = rows.map(r => ({
      ...pick(expandProperties<any>(r),[
        'id',
        'idNumber',
        'title',
        'status',
        'startTime',
        'isMission',
      ]),
    }));

    res.json({
      list: activities
    })
  });
}