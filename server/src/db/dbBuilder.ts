import { createLogger } from '../logging';
import KnexFactory, { Knex } from 'knex';
//@ts-ignore
import KnexSqlite from 'knex/lib/dialects/better-sqlite3';
//@ts-ignore
import KnexMssql from 'knex/lib/dialects/mssql';
const log = createLogger('knex');

function build() {
  const commonOptions = {
    log: {
      warn(warning: string) { log.warn('', warning); },
      error(err: string) { log.error('', err); },
      debug(message: string) { log.debug('', message); },
    },
    debug: true,
  };

  let factory :() => Knex.QueryInterface;
  if (process.env.DB_HOST) {
    if (!process.env.DB_NAME || !process.env.DB_USER || !process.env.DB_PASS) {
      throw new Error('DB environment not set (DB_NAME, DB_USER, DB_PASS)');
    }
    log.info(`Using MSSQL ${process.env.DB_HOST}`);

    factory = () => KnexFactory({
      ...commonOptions,
      client: KnexMssql,
      connection: {
        server: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        options: {
          port: 1433,
          database: process.env.DB_NAME,
          encrypt: true,
        } as any
      }
    })
    .withSchema('respond');

  } else {
    factory = () => KnexFactory({
      ...commonOptions,
      client: KnexSqlite,
      connection: {
        filename: './store.sqlite',
      }
    })
  }


  return factory;
}


export const getKnex = build();
