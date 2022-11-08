import * as React from 'react';
import { observer } from "mobx-react";
import { Routes, Route } from "react-router-dom";
import Store from "../../store";
import AdminStore from "../../store/adminStore";
import AdminHomePage from "./AdminHomePage";
import AdminChrome from './AdminChrome';
import { Typography } from '@mui/material';

class AdminFactory {
  rootStore?: Store;
  store?: AdminStore;

  get(rootStore: Store) {
    if (this.rootStore !== rootStore) {
      this.rootStore = rootStore;
      this.store = new AdminStore(rootStore);
    }
    return this.store!;
  }
}
const factory = new AdminFactory();

export const AdminRoutes = (props: {
  store: Store
}) => {
  const adminStore = factory.get(props.store);
  return (
    <Routes>
      <Route element={<AdminChrome />}>
        <Route index element={<AdminHomePage store={adminStore} />} />
        <Route path="*" element={<Typography>Page not found</Typography>} />
      </Route>
    </Routes>
  );
};

export default observer(AdminRoutes);