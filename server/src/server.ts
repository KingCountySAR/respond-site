import express from "express";
import session from 'express-session';
import KnexSessionStore from './knexSessionStore';
import { getKnex } from './db/dbBuilder';
import { addAuthApi } from "./api/authApi";
import { createLogger } from "./logging";
import { Logger } from "winston";

export default class Server {
  log: Logger;

  constructor() {
    this.log = createLogger('server');
  }

  async boot() {
    const app = express();
    app.use(express.static("public"));

    app.use(express.json());

    app.use(session({
      secret: process.env.SESSION_SECRET || 'psw8e56b9vqpe956qbt',
      resave: true,
      name:'session',
      saveUninitialized:false,
      store: new KnexSessionStore(getKnex),
    }))

    app.get('/api/test',(req, res)=>{
      res.json({"message":"Hello World!!"});
    });

    addAuthApi(app);

    const port = process.env.PORT || 3333;
    app.listen(port);
    this.log.info('Server ready at port ' + port);
  }
}
