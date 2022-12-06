import { action, computed, makeObservable, observable, onBecomeObserved, runInAction } from "mobx";
import Store from ".";
import { OrgDetails } from "../../../server/api-models/site-admin/OrgDetails";
import { OrgSummary } from "../../../server/api-models/site-admin/OrgSummary";

class Loadable<T> {
  private loader: () => Promise<T>;
  @observable isLoading: boolean = false;
  @observable loadError?: string;
  @observable value?: T;

  constructor(loader: () => Promise<T>) {
    this.loader = loader;
    makeObservable(this);
  }

  @action.bound
  async load() {
    this.isLoading = true;
    this.loadError = undefined;
    try {
      const result = await this.loader();
      runInAction(() => this.value = result);
    } catch (error: unknown) {
      runInAction(() => this.loadError = error + '');
    } finally {
      runInAction(() => this.isLoading = false);
    }
  }
}

class AdminStore {
  private store: Store;
  @observable orgList: Loadable<OrgSummary[]> = new Loadable<OrgSummary[]>(this.loadOrganizations);
  @observable orgDetail: Loadable<OrgDetails> = new Loadable<OrgDetails>(() => this.loadOrgDetails());
  @observable detailOrgId: number = 0;

  constructor(store: Store) {
    this.store = store;
    makeObservable(this);
    onBecomeObserved(this, 'orgList', () => this.orgList.load());
  }

  @computed
  get adminName() {
    return this.store.user?.name;
  }

  @action.bound
  loadOrganization(id: number) {
    if (id !== this.detailOrgId) {
      this.detailOrgId = id;
      this.orgDetail.load();
    }
  }

  private async loadOrgDetails() {
    const result = await (await fetch(`/api/site-admin/organizations/${this.detailOrgId}`)).json();
    return result;
  }

  private async loadOrganizations() {
    const result = await (await fetch('/api/site-admin/organizations')).json();
    return result.list;
  }
}

export default AdminStore;