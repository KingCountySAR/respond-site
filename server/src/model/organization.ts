import { OrganizationRow } from "../db/organizationRow";

export default class Organization {
  id: number = 0;
  domain: string = '';
  title: string = '';
  rosterName?: string;
  mouName?: string;
  allowedAuthDomains?: string[];
  brand?: {
    primary?: string;
  };
  adminOnly: boolean = false;
  hasMissions: boolean = false;
  memberProvider: {
    provider: string,
    [key:string]: any,
  } = { provider: 'LocalDatabaseMembers' };

  static fromRow(row: OrganizationRow) :Organization {
    let org = Object.assign(
      new Organization(),
      {
        ...JSON.parse(row.properties),
        id: row.id,
        domain: row.domain,
      }
    );
    return org;
  }

  toRow() :OrganizationRow {
    const { id, domain, ...json } = this;
    return {
      id,
      domain,
      properties: JSON.stringify(json),
    }
  }
}