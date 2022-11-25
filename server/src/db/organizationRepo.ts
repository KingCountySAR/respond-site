import Organization from "../model/organization";
import { DbWrapper } from "./dbBuilder";

export class OrganizationRepo {
  private db: DbWrapper;
  private orgs: Organization[] = [];

  constructor(db: DbWrapper) {
    this.db = db;
  }

  async get(id: number) {
    return (await this.getAll()).find(r => r.id === id);
  }

  async getFromDomain(domain: string) {
    return (await this.getAll()).find(r => r.domain === domain);
  }

  private async getAll() {
    if (this.orgs.length == 0) {
      this.orgs = (await this.db.knex.table(this.db.t('organizations'))).map(r => Organization.fromRow(r)) ?? [];
    }
    return this.orgs;
  }
}