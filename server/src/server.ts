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



export default class Server {
  log: Logger;

  constructor() {
    this.log = createLogger('server');
  }

  async boot() {
    const db = await buildDatabase();
    const repo = new Repository(db);

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
    addAuthApi(app, authClient, repo, this.log);
    addCoreApi(app, repo, this.log);


    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, '../public', 'index.html'));
    });

    const port = process.env.PORT || 3333;
    app.listen(port);
    this.log.info('Server ready at port ' + port);
  }
}
