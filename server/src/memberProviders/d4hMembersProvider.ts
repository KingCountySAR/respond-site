import { config } from 'dotenv';
import fetch from 'node-fetch';
import { Logger } from "winston";
import Repository from "../db/repository";
import { MemberAuthInfo, MemberInfo, MemberProvider } from "./memberProvider";

const D4H_MEMBER_REFRESH_SECS = 10;
const D4H_FETCH_LIMIT = 250;

interface D4HConfig {
  provider: 'd4hMembers',
  token: string,
  moreEmailsField: 'Secondary Email',
}

interface D4HMemberResponse {
  id: number,
  ref?: string,
  name: string,
  email?: string,
  mobilephone?: string,
  group_ids?: number[],
  custom_fields: any[],
}

interface D4HMember {
  response: D4HMemberResponse,
  memberInfo: MemberInfo,
}

interface FetchForTokenEntry {
  lastFetch: number,
  lookup: {[d4hId:number]: D4HMember},
  authEmailToD4HId: {[email:string]: D4HMember},
}

export default class D4HMembersProvider implements MemberProvider {
  readonly repo: Repository;
  readonly log: Logger;

  readonly tokenFetchInfo: {[token: string]: FetchForTokenEntry} = {};

  constructor(repo: Repository, log: Logger) {
    this.repo = repo;
    this.log = log;
  }

  async getMemberInfo(organizationId: number, auth: MemberAuthInfo): Promise<MemberInfo | undefined> {
    const organization = await this.repo.organizations.get(organizationId);
    if (!organization) {
      throw new Error("Unknown organization");
    }

    const config = organization?.memberProvider as D4HConfig;
    if (!config || !config.token) {
      this.log.warn("Could not find memberProvider config or D4H token for org " + organizationId);
      throw new Error("Invalid Configuration");
    }

    if (!this.tokenFetchInfo[config.token]) {
      throw new Error("Server is out of sync with member database");
    }

    const info = this.tokenFetchInfo[config.token]?.authEmailToD4HId?.[auth.email]?.memberInfo;
    return {
      ...info,
      id: `${organizationId}:${info.id}`,
    };
  }

  async refresh() {
    const start = new Date().getTime();
    const tokenOrgs: {[token:string]: number[]} = {};
    const moreEmails: {[token:string]: string} = {};

    (await this.repo.organizations.getAll())
    .filter(o => o.memberProvider?.provider === 'D4HMembers')
    .forEach(org => {
      const token = org.memberProvider.token;
      tokenOrgs[token] = [ ...tokenOrgs[token] ?? [], org.id];
      moreEmails[token] = org.memberProvider.moreEmailsLabel ?? 'Secondary Email';
    })

    for (let token in tokenOrgs) {
      await this.refreshMembersForToken(token, moreEmails[token]);
    }

    return {
      ok: true,
      runtime: (new Date().getTime() - start),
    };
  }

  async refreshMembersForToken(token: string, moreEmailsLabel?: string) {
    this.log.info("Starting refresh for D4H for token " + token.substring(0, 4) + "...")
    let offset: number = 0;

    let groupRows: any[] = [];
    do {
      const chunk = (await (await fetch(`https://api.d4h.org/v2/team/groups?limit=${D4H_FETCH_LIMIT}&offset=${offset}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })).json())?.data as any[];

      offset += D4H_FETCH_LIMIT;
      groupRows = groupRows.concat(chunk);
    } while (offset === groupRows.length);

    const groupLookup = groupRows.reduce((accum, cur) => ({ ...accum, [cur.id]: cur.title }), {} as {[id:number]: string});

    let rows: D4HMemberResponse[] = [];
    offset = 0;
    do {
      const url = `https://api.d4h.org/v2/team/members?include_custom_fields=true&include_details=true&limit=${D4H_FETCH_LIMIT}&offset=${offset}`;
      this.log.info("Fetching " + url, offset, rows.length);
      const chunk = (await (await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })).json())?.data as D4HMemberResponse[];

      offset += D4H_FETCH_LIMIT;
      rows = rows.concat(chunk);
    } while (offset === rows.length);

    let emailLookup: {[authEmail:string]: D4HMember} = {};

    const lookup = rows.reduce((accum, cur) => {

      const memberInfo :MemberInfo = {
        id: cur.id + '',
        groups: cur.group_ids?.reduce((accum, cur) => [ ...accum, groupLookup[cur]], [] as string[]) ?? [],
      };

      const member :D4HMember = {
        response: cur,
        memberInfo: memberInfo,
      };
      
      if (cur.email) {
        emailLookup[cur.email] = member;
      }
      if (moreEmailsLabel) {
        const moreEmails = (cur.custom_fields?.find(f => f.label === moreEmailsLabel)?.value as string ?? '').split(/[;, \/]+/);
        moreEmails.forEach(email => emailLookup[email] = member);
      }

      return { ...accum, [cur.id]: member };
    }, {} as {[d4hId:number]: D4HMember})

    this.tokenFetchInfo[token] = {
      lastFetch: new Date().getTime(),
      lookup,
      authEmailToD4HId: emailLookup,
    }
  }
}