import '../modules';
import { Express } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { Logger } from 'winston';
import Repository from '../db/repository';
import { MemberProviderRegistry } from '../memberProviders/memberProvider';
import { userFromAuth } from './apiUtils';

export function addAuthApi(app: Express, authClient: OAuth2Client, memberProviderRegistry: MemberProviderRegistry, repo: Repository, log: Logger) {
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

    const memberProvider = memberProviderRegistry.get(organization.memberProvider?.provider);
    console.log('get memberProvider for ', organization.memberProvider?.provider ?? "NOT SET IN JSON", memberProvider);
    if (!memberProvider) {
      log.warn(`Can't find memberProvider for org ${organization.id}: ${organization.memberProvider?.provider}`);
      res.status(500).json({error: 'Invalid configuration'});
      return;
    }

    const authInfo = {
      provider: 'google',
      email: payload.email,
    };
    const memberInfo = await memberProvider.getMemberInfo(organization.id, authInfo, organization.memberProvider);
    if (!memberInfo) {
      res.status(403).json({error: 'User not known' });
      return;
    }

    req.session.auth = {
      email: payload.email,
      userId: memberInfo.id,
      organizationId: organization.id,
      groups: memberInfo.groups,
      isSiteAdmin: organization.id === 1,
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