import { computed, makeObservable } from "mobx";
import Store from ".";

class AdminStore {
  private store: Store;

  constructor(store: Store) {
    this.store = store;
    makeObservable(this);
  }

  @computed
  get adminName() {
    return this.store.user?.name;
  }
}

export default AdminStore;