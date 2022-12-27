import '../modules';
import { Express } from 'express';
import { Logger } from 'winston';
import Repository from '../db/repository';
import { catchErrors, userFromAuth, organizationFromReq, expandProperties, pick, AuthData } from './apiUtils';
import { existsSync, readFileSync } from 'fs';
import { SiteConfig } from '../../api-models/siteConfig';
import Responder from '../model/responder';
import { OrgActivityModel } from '../../api-models/activityModel';
import { SocketServer } from '../server';
import Organization from '../model/organization';

export function addCoreApi(app: Express, repo: Repository, log: Logger) {
  app.get('/api/session', async (req, res) => {
    catchErrors(res, log, async () => {
      // if (!req.session?.auth && existsSync('local-auth.json')) {
      //   log.info('using debug login credentials in local-auth.json');
      //   req.session.auth = JSON.parse(readFileSync('local-auth.json', 'utf8'));
      // }

      const org = await organizationFromReq(req, repo);
      const result = await getSessionState(org, req.session.auth, repo, log);
      res.json(result);
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

export function addCoreSocketHandlers(io: SocketServer, repo: Repository, log: Logger) {
  io.on('connect', (socket) => {
    //console.log('My Socket', socket.handshake.headers.host?.split(':')[0]);
    socket.emit('welcome', JSON.stringify({headers: socket.handshake.headers, session: (socket.request as any).session}));
    // repo.organizations.get((socket.request as any).session.auth.organizationId)
    // .then((org?: Organization) => {
    //   return getSessionState(org, (socket.request as any).session.auth, repo, log);
    // })
    // .then(state => {
    //   socket.emit('welcome', state as any);
    // });
  });
}

async function getSessionState( org: Organization|undefined, auth: AuthData|undefined, repo: Repository, log: Logger) {
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

  return {
    organization: {
      ...org,
      partners: org?.partners.map(p => ({
        partner: p.partner,
        canCreateEvents: p.canCreateEvents,
        canCreateMissions: p.canCreateMissions,
      }))
    },
    config,
    user: userFromAuth(auth),
  };
}