import { Express } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { Logger } from 'winston';
import { DbWrapper } from '../db/dbBuilder';
import { OrganizationRow } from '../db/organizationRow';
import Repository from '../db/repository';
import Organization from '../model/organization';
import { AuthData, userFromAuth } from './apiUtils';

declare module 'express-session' {
  export interface SessionData {
    auth: AuthData
  }
}

export function addAuthApi(app: Express, authClient: OAuth2Client, repo: Repository, log: Logger) {
  app.post('/api/auth/google', async (req, res) => {
    const { token } = req.body;
    log.debug('CLIENT_ID', { token, clientId: process.env.CLIENT_ID })
    const ticket = await authClient.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload) {
      res.status(500).json({message: 'Could not get ticket'});
      return;
    }
    if (!payload.email) {
      res.status(500).json({message: 'Could not get user email'});
      return;
    }

    const domain = (process.env.environment === 'prod' ? req.hostname : (req.headers['x-forwarded-host'] as string ?? req.hostname)).split(':')[0];
    const organization = await repo.organizations.getFromDomain(domain);
    console.log(organization);

    if (!organization) {
      log.info(`${payload.email} trying to login with unknown domain ${domain}`);
      res.status(403).json({error: 'Invalid domain'});
      return;
    }

    if ((organization.allowedAuthDomains?.indexOf(payload.hd ?? '') ?? 0) < 0) {
      console.log(`${payload.email} from domain ${payload.hd} not allowed`);
      res.status(403).json({error: 'User not from allowed domain' });
      return;
    }

    req.session.auth = {
      email: payload.email,
      userId: `google:${payload.email}`,
      organizationId: organization.id,
      ...payload,
    };
    log.info(`Logged in ${payload.email}`);
    res.status(200);
    res.json(userFromAuth(req.session.auth));
  })

  app.post('/api/auth/logout', (req, res) => {
    req.session?.destroy(err => {
      if (err) {
        res.status(400).json({ error: 'Unable to log out' })
      } else {
        res.json({ msg: 'Logout successful' })
      }
    });
  })
}