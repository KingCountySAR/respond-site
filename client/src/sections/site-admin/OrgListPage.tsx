import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Skeleton } from "@mui/material";
import { DataGrid, GridColDef, GridSortModel } from "@mui/x-data-grid";
import { observer } from "mobx-react";
import AdminStore from "../../store/adminStore";

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 80 },
  { field: 'title', headerName: 'Name', width:350, flex: 1, renderCell: (params) => <RouterLink to={`/site-admin/organizations/${params.row.id}`}>{params.row.title}</RouterLink>},
  { field: 'domain', headerName: 'Domain', width:300, flex: 0.5 },
];

export const OrgListPage = ({store}: {
  store: AdminStore
}) => {
  const [sortModel, setSortModel] = React.useState<GridSortModel>([
    {
      field: 'title',
      sort: 'asc',
    },
  ]);

  return (
    <Box style={{flex:'1 1 auto', minHeight:300}}>
      {store.orgList.isLoading ? (
        <Skeleton />
      ) : store.orgList.loadError ? (
        <Alert severity="error">{store.orgList.loadError}</Alert>
      ) : ( store.orgList.value &&
      <DataGrid
        rows={store.orgList.value}
        columns={columns}
        pageSize={50}
        // onRowClick={(data: GridRowParams) => console.log('row click', JSON.parse(JSON.stringify(data.row)))}
        disableSelectionOnClick={true}
        sortModel={sortModel}
        onSortModelChange={(model) => setSortModel(model)}
        />
      )}
    </Box>
  );
};

export default observer(OrgListPage);