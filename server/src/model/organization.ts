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
}