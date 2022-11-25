import { action, computed, makeObservable, observable, onBecomeObserved, runInAction } from "mobx";
import Store from ".";
import { MyActivityModel, OrgActivityModel } from "../../../server/api-models/activityModel";

class MainStore {
  private store: Store;
  @observable activities: OrgActivityModel[] = [];
  @observable loadingActivities: boolean = false;
  @observable activitiesError?: string;
  @observable myActivities: MyActivityModel[] = [];
  @observable loadingMyActivities: boolean = false;
  @observable myActivitiesError?: string;

  constructor(store: Store) {
    this.store = store;
    makeObservable(this);
    onBecomeObserved(this, 'activities', this.loadActivities);
    onBecomeObserved(this, 'myActivities', this.loadMyActivities);
  }

  @computed
  get brand() {
    return this.store.config.brand;
  }

  @computed
  get organization() {
    return this.store.config.organization;
  }

  @computed
  get missions() {
    return this.activities.filter(f => f.isMission)
  }

  @computed
  get otherActivities() {
    return this.activities.filter(f => !f.isMission);
  }

  @action.bound
  async loadActivities() {
    this.activitiesError = undefined;
    this.loadingActivities = true;
    try {
      const result = await (await fetch(`/api/organizations/${this.store.config.organization?.id}/activities`)).json() as {list:OrgActivityModel[]};
      runInAction(() => this.activities = result.list);
    } catch (error: unknown) {
      runInAction(() => this.activitiesError = error + '');
    } finally {
      runInAction(() => this.loadingActivities = false);
    }
  }

  @action.bound
  async loadMyActivities() {
    this.myActivitiesError = undefined;
    this.loadingMyActivities = true;
    try {
      const result = await (await fetch(`/api/main/mystatus`)).json() as {list:MyActivityModel[]};
      runInAction(() => this.myActivities = result.list);
    } catch (error: unknown) {
      runInAction(() => this.myActivitiesError = error + '');
    } finally {
      runInAction(() => this.loadingMyActivities = false);
    }

  }
}

export default MainStore;