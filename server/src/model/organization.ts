import { OrganizationRow } from "../db/organizationRow";
import { PartnershipRow } from "../db/partnershipRow";

export class Partnership {
  id: number = 0;
  organizationId: number = 0;
  partner: { id: number; title: string; } = { id: 0, title: '' };
  canViewEvents: boolean = false;
  canCreateEvents: boolean = false;
  canCreateMissions: boolean = false;

  static fromRow(row: PartnershipRow) :Partnership {
    let partnership: Partnership = Object.assign(
      new Partnership(),
      {
        ...JSON.parse(row.properties),
        id: row.id,
        organizationId: row.organizationId,
        partner: { id: row.partnerOrgId, title: ''},
        canViewEvents: row.canViewEvents,
      }
    );
    return partnership;
  }
}

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

  partners: Partnership[] = [];

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