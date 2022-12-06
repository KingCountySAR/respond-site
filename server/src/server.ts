import express from 'express';
import session from 'express-session';
import path from 'path';
import { OAuth2Client } from 'google-auth-library';
import { Logger } from 'winston';


import KnexSessionStore from './knexSessionStore';
import { buildDatabase } from './db/dbBuilder';
import { addAuthApi } from './api/authApi';
import { createLogger } from './logging';
import { addCoreApi } from './api/coreApi';
import Repository from './db/repository';
import { defaultMembersRepositoryRegistry } from './memberProviders/memberProvider'
import LocalDatabaseMembersProvider from './memberProviders/localDatabaseMembersProvider';
import { addSiteAdminApi } from './api/siteAdminApi';
import D4HMembersProvider from './memberProviders/d4hMembersProvider';


export default class Server {
  log: Logger;

  constructor() {
    this.log = createLogger('server');
  }

  async boot() {
    const db = await buildDatabase();
    const repo = new Repository(db);
    defaultMembersRepositoryRegistry.register('LocalDatabaseMembers', new LocalDatabaseMembersProvider(repo, this.log));
    const d4hMembers = new D4HMembersProvider(repo, this.log);
    defaultMembersRepositoryRegistry.register('D4HMembers', d4hMembers);
    d4hMembers.refresh();
    
    const app = express();
    app.use(express.static('public'));

    app.use(express.json());

    app.use(session({
      secret: process.env.SESSION_SECRET || 'psw8e56b9vqpe956qbt',
      resave: true,
      name:'session',
      saveUninitialized:false,
      store: new KnexSessionStore(db),
    }))

    this.log.debug('Auth ClientID:', { id: process.env.AUTH_CLIENT })
    const authClient = new OAuth2Client(process.env.AUTH_CLIENT);
    addSiteAdminApi(app, repo, this.log);
    addAuthApi(app, authClient, defaultMembersRepositoryRegistry, repo, this.log);
    addCoreApi(app, repo, this.log);

    app.get('/site-admin/*', (req, res) => {
      if (req.session?.auth && !req.session.auth.isSiteAdmin) {
        res.status(403).json({error: "Permission denied"});
      } else {
        res.sendFile(path.resolve(__dirname, '../public', 'index.html'));
      }
    })

    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, '../public', 'index.html'));
    });

    const port = process.env.PORT || 3333;
    app.listen(port);
    this.log.info('Server ready at port ' + port);
  }
}
