export interface MemberInfo {
  id: string;
  groups: string[];
}

export interface MemberAuthInfo {
  provider: string;
  email: string;
  [key: string]: any;
}

export interface MemberProvider {
  getMemberInfo(organizationId: number, authPayload: MemberAuthInfo, providerOptions: any): Promise<MemberInfo|undefined>;
}

export class MemberProviderRegistry {
  private lookup: {[key:string]: MemberProvider} = {};

  register(key: string, provider: MemberProvider) {
    this.lookup[key] = provider;
  }

  get(key: string) {
    return this.lookup[key];
  }
}

export const defaultMembersRepositoryRegistry = new MemberProviderRegistry();
