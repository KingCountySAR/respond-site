import { SessionData, Store } from 'express-session';
import { Knex } from 'knex';
import { DbWrapper } from './db/dbBuilder';

const noop = () => {}

export default class KnexSessionStore extends Store {
  readonly knex: Knex;
  readonly table: string;

  constructor(db: DbWrapper) {
    super();
    this.knex = db.knex;
    this.table = db.t('sessions');
  }

  get(sid: string, callback: (err: any, session?: SessionData | null | undefined) => void = noop): void {
    this.knex.table<{sid: string, session: string}>(this.table)
      .where('sid', sid)
      .first()
      .then(row => {
        callback(undefined, row ? JSON.parse(row.session) : undefined);
      });
  }

  set(sid: string, session: SessionData, callback?: ((err?: any) => void) | undefined): void {
    this.knex.transaction(async trx => {
      await trx.table(this.table).where('sid', sid).del();
      await trx.table(this.table).insert({ sid, session: JSON.stringify(session) })
      callback?.();
    });
  }

  destroy(sid: string, callback?: ((err?: any) => void) | undefined): void {
    this.knex()
      .table(this.table)
      .where('sid', sid)
      .del()
      .then(() => callback?.());
  }
}