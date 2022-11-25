import * as React from 'react';
import { observer } from "mobx-react";
import { Routes, Route } from "react-router-dom";
import Store from "../../store";
import AdminStore from "../../store/adminStore";
import { Typography } from '@mui/material';
import MainChrome from './MainChrome';
import MainStore from '../../store/mainStore';

class MainFactory {
  rootStore?: Store;
  store?: MainStore;

  get(rootStore: Store) {
    if (this.rootStore !== rootStore) {
      this.rootStore = rootStore;
      this.store = new MainStore(rootStore);
    }
    return this.store!;
  }
}
const factory = new MainFactory();

export const MainRoutes = (props: {
  store: Store
}) => {
  const mainStore = factory.get(props.store);
  return (
    <Routes>
      <Route element={<MainChrome store={mainStore} />}>
        <Route index element={<div>Home page</div>}/>
        <Route path="/about" element={<div>About page</div>}/>
      </Route>
    </Routes>
  );
};

export default observer(MainRoutes);