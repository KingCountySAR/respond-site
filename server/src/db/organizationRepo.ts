import Organization, { Partnership } from "../model/organization";
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
      const partners :{[key:number]: Partnership[]} = (await this.db.knex.table(this.db.t('orgPartnerships'))).reduce((accum, cur) => {
        return ({
          ...accum,
          [cur.organizationId]: [
            ...accum[cur.organizationId] ?? [],
            Partnership.fromRow(cur),
          ]
        })
      }, {}) ?? {};

      const orgTitles: {[id: number]: string } = {};

      this.orgs = (await this.db.knex.table(this.db.t('organizations'))).map(r => {
        const org = Organization.fromRow(r);
        org.partners = partners[r.id];
        orgTitles[org.id] = org.title;
        return org;
      }) ?? [];

      // Now that we know org names, update the partnerships pointing to an org.
      Object.values(partners).forEach(list => list.forEach(p => p.partner = { id: p.partner.id, title: orgTitles[p.partner.id] ?? 'Unknown'}));
    }

    return this.orgs;
  }
}