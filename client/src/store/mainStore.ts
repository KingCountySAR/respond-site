import { computed, makeObservable } from "mobx";
import Store from ".";

class MainStore {
  private store: Store;

  constructor(store: Store) {
    this.store = store;
    makeObservable(this);
  }

  @computed
  get brand() {
    return this.store.config.brand;
  }

  @computed
  get organization() {
    return this.store.config.organization;
  }
}

export default MainStore;