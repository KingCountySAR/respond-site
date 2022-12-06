import Organization from "../model/organization";
import { DbWrapper } from "./dbBuilder";

export class OrganizationRepo {
  private db: DbWrapper;
  private orgs: Organization[] = [];

  constructor(db: DbWrapper) {
    this.db = db;
  }

  async getAll() {
    return await this.loadAll();
  }

  async get(id: number) {
    return (await this.loadAll()).find(r => r.id === id);
  }

  async getFromDomain(domain: string) {
    return (await this.loadAll()).find(r => r.domain === domain);
  }

  async save(updated: Organization) {
    const { id, ...rest } = updated.toRow();
    await this.db.knex.table(this.db.t('organizations')).where('id', id).update(rest);
    this.orgs = [];
    return this.get(id);
  }

  private async loadAll() {
    if (this.orgs.length == 0) {
      this.orgs = (await this.db.knex.table(this.db.t('organizations'))).map(r => Organization.fromRow(r)) ?? [];
    }
    return this.orgs;
  }
}