import { SessionData, Store } from 'express-session';
import { Knex } from 'knex';

const noop = () => {}

export default class KnexSessionStore extends Store {
  readonly getKnex: () => Knex.QueryInterface;

  constructor(getKnex: () => Knex.QueryInterface) {
    super();
    this.getKnex = getKnex;
  }
  get(sid: string, callback: (err: any, session?: SessionData | null | undefined) => void = noop): void {
    this.getKnex().table<{sid: string, session: string}>('sessions')
      .where('sid', sid)
      .first()
      .then(row => {
        callback(undefined, row ? JSON.parse(row.session) : undefined);
      });
  }
  set(sid: string, session: SessionData, callback?: ((err?: any) => void) | undefined): void {
    this.getKnex()
      .table('sessions')
      .insert({
        sid,
        session: JSON.stringify(session),
      })
      .then(() => {
        callback?.();
      });
  }
  destroy(sid: string, callback?: ((err?: any) => void) | undefined): void {
    this.getKnex()
      .table('sessions')
      .where('sid', sid)
      .del()
      .then(() => {
        callback?.();
      });
  }

}