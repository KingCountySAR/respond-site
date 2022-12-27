import './modules';
import express from 'express';
import session from 'express-session';
import path from 'path';
import { OAuth2Client } from 'google-auth-library';
import { Logger } from 'winston';
import morgan from 'morgan';
import { Server as IOServer } from 'socket.io';
import http from 'http';

import KnexSessionStore from './knexSessionStore';
import { buildDatabase } from './db/dbBuilder';
import { addAuthApi } from './api/authApi';
import { createLogger } from './logging';
import { addCoreApi, addCoreSocketHandlers } from './api/coreApi';
import Repository from './db/repository';
import { defaultMembersRepositoryRegistry } from './memberProviders/memberProvider'
import LocalDatabaseMembersProvider from './memberProviders/localDatabaseMembersProvider';
import { addSiteAdminApi } from './api/siteAdminApi';
import D4HMembersProvider from './memberProviders/d4hMembersProvider';
import * as SocketApi from '../api-models/socketApi';
import { AuthData } from './api/apiUtils';

export class SocketServer extends IOServer<
  SocketApi.ClientToServerEvents,
  SocketApi.ServerToClientEvents,
  SocketApi.InterServerEvents,
  SocketApi.SocketData
> {
}

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
    app.use(morgan(
      ':method :url :status :res[content-length] - :response-time ms',
      {
        stream: {
          // Configure Morgan to use our custom logger with the http severity
          write: (message) => this.log.info(message.trim()),
        },
      }));
    app.use(express.static('public'));

    app.use(express.json());

    const sessionMiddleware = session({
      secret: process.env.SESSION_SECRET || 'psw8e56b9vqpe956qbt',
      resave: true,
      name:'session',
      saveUninitialized:false,
      store: new KnexSessionStore(db),
    });
    app.use(sessionMiddleware);

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

  
    const server = http.createServer(app);
    const io = new SocketServer(server, {
      path: '/socket'
    });
    const connectToSocketMiddleware = (middleware: any) => (socket: any, next: any) => middleware(socket.request, {}, next);
    io.use(connectToSocketMiddleware(sessionMiddleware));
    // io.use((socket, next) => {
    //   const auth: AuthData|undefined = (socket.request as any).session?.auth;
    //   if (auth) {
    //     next();
    //   } else {
    //     next(new Error('not authenticated'));
    //   }
    // })
    addCoreSocketHandlers(io, repo, this.log);

    const port = process.env.PORT || 3333;
    server.listen(port, () => {
      this.log.info('Server ready at port ' + port);
    });
  }
}
