import express, { Response } from 'express';
import session from 'express-session';
import { OAuth2Client } from 'google-auth-library';
import { Logger } from 'winston';
import { existsSync, readFileSync } from 'fs';

import KnexSessionStore from './knexSessionStore';
import { db } from './db/dbBuilder';
import { addAuthApi, userFromAuth } from './api/authApi';
import { createLogger } from './logging';

export async function withErrors(res: Response, log:Logger, action: () => Promise<void>) {
  try {
    await action();
  } catch (err) {
    log.error(err);
    res.status(500).json({ message: err });
  }
}

export default class Server {
  log: Logger;

  constructor() {
    this.log = createLogger('server');
  }

  async boot() {
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

    app.get('/api/boot', async (req, res) => {
      withErrors(res, this.log, async () => {
        if (!req.session?.auth && existsSync('local-auth.json')) {
          this.log.info('using debug login credentials in local-auth.json');
          req.session.auth = JSON.parse(readFileSync('local-auth.json', 'utf8'));
        }
  
        res.json({
          user: userFromAuth(req.session.auth),
          config: { clientId: process.env.AUTH_CLIENT }
        })
      });
    });

    this.log.debug('Auth ClientID:', { id: process.env.AUTH_CLIENT })
    const authClient = new OAuth2Client(process.env.AUTH_CLIENT);
    addAuthApi(app, authClient, this.log);

    const port = process.env.PORT || 3333;
    app.listen(port);
    this.log.info('Server ready at port ' + port);
  }
}
