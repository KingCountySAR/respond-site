import * as React from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { Alert, Box, Button, Card, CardContent, Checkbox, FormControl, FormControlLabel, FormGroup, FormHelperText, IconButton, InputLabel, MenuItem, Select, Skeleton, TextField, Typography } from "@mui/material";
import { observer } from "mobx-react";
import AdminStore from "../../store/adminStore";
import { action, computed, makeObservable, observable, reaction, runInAction } from 'mobx';
import { OpenInNew } from '@mui/icons-material';
import { apiPost } from '../../store/api';
import { OrgDetails } from '../../../../server/api-models/site-admin/OrgDetails';

class OrgDetailUiStore {
  readonly store: AdminStore
  @observable working: boolean = false;
  @observable editOrg?: OrgDetails;

  constructor(store: AdminStore) {
    this.store = store;
    reaction(
      () => this.org.value,
      org => {
        this.editOrg = JSON.parse(JSON.stringify(org));
      });
      makeObservable(this);
  }

  @computed
  get org() {
    return this.store.orgDetail;
  }

  @computed
  get canSave() {
    return this.working;
  }

  @action.bound
  init(orgId: number) {
    this.store.loadOrganization(orgId);
  }

  @action.bound
  async save() {
    if (!this.editOrg) return;

    try {
      this.working = true;
      await apiPost(`/api/site-admin/organizations/${this.editOrg.id}`, this.editOrg);
    } finally {
      runInAction(() => this.working = false);
    }
  }
}

export const OrgDetailPage = observer(({store}: {
  store: OrgDetailUiStore
}) => {
  const { orgId } = useParams();
  React.useEffect(() => {
    store.init(parseInt(orgId!));
  }, [ store, orgId ]);

  return (
    <Box style={{flex:'1 1 auto', minHeight:300}}>
      {store.org.isLoading ? (
        <Skeleton />
      ) : store.org.loadError ? (
        <Alert severity="error">{store.org.loadError}</Alert>
      ) : ( store.editOrg &&
        <>
          <Card sx={{maxWidth: 'sm', mb:2}}>
            <CardContent>
              <Box component="form" sx={{'& .MuiTextField-root': { m: 1 }}}>
                <Typography gutterBottom variant="h5" component="div">Organization</Typography>
                <Box>
                  <TextField label="Organization Title" variant="standard" fullWidth value={store.editOrg.title} onChange={evt => runInAction(() => store.editOrg!.title = evt.currentTarget.value)}/>
                </Box>
                <Box>
                  <TextField label="Display on Roster" variant="standard" value={store.editOrg.rosterName} onChange={evt => runInAction(() => store.editOrg!.rosterName = evt.currentTarget.value)}/>
                  <TextField label="Display on Mutual Aid Roster" variant="standard" value={store.editOrg.mouName} onChange={evt => runInAction(() => store.editOrg!.mouName = evt.currentTarget.value)}/>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{maxWidth: 'sm', mb:2}}>
            <CardContent>
              <Box component="form" sx={{'& .MuiTextField-root': { m: 1 }}}>
                <Typography gutterBottom variant="h5" component="div">Mission Response</Typography>
                <FormGroup>
                  <FormControlLabel control={<Checkbox checked={store.editOrg.hasMissions} onChange={evt => runInAction(() => store.editOrg!.hasMissions = evt.currentTarget.checked)} />} label="Has Mission Jurisdiction" />
                </FormGroup>
                <FormHelperText>Missions can be created on behalf of this organization. Other organizations respond in support to this organization.</FormHelperText>
                <FormGroup>
                  <FormControlLabel control={<Checkbox checked={store.editOrg.adminOnly} onChange={evt => runInAction(() => store.editOrg!.adminOnly = evt.currentTarget.checked)} />} label="Administrative-only Organization" />
                </FormGroup>
                <FormHelperText>This organization does not respond to missions. It exists to organize other operational organizations.</FormHelperText>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{maxWidth: 'sm', mb:2}}>
            <CardContent>
              <Box component="form" sx={{'& .MuiTextField-root, & .MuiFormControl-root': { m: 1 }}}>
                <Typography gutterBottom variant="h5" component="div">Site Configuration</Typography>
                <Box sx={{ width: '25em', display: 'flex', alignItems:'baseline' }}>
                  <TextField label="Response Domain" fullWidth variant="standard" value={store.editOrg.domain} onChange={evt => runInAction(() => store.editOrg!.domain = evt.currentTarget.value)}/>
                  <IconButton component={RouterLink} to={`//${store.editOrg.domain}`} target="_blank" color="secondary"><OpenInNew /></IconButton>
                </Box>
                <Box sx={{display:'flex', alignItems:'baseline'}}>
                  <TextField label="Primary Color" variant="standard" value={store.editOrg.brand?.primary} onChange={evt => runInAction(() => store.editOrg!.brand = { ...store.editOrg!.brand, primary: evt.currentTarget.value })}/>
                  <div style={{backgroundColor:store.editOrg.brand?.primary, width:'1.6em', height:'1.6em', borderRadius:'33%'}}></div>
                </Box>
                <Box>
                  <FormControl fullWidth>
                    <InputLabel id="membership-provider">Membership Provider</InputLabel>
                    <Select labelId="membership-provider" value={store.editOrg.memberProvider.provider} label="Membership Provider">
                      <MenuItem value="D4HMembers">D4H</MenuItem>
                    </Select>
                  </FormControl>
                  {store.editOrg.memberProvider.provider === 'D4HMembers' ? (
                    <Box sx={{ width: '30em', ml:4 }}>
                      <TextField label="Authorization Token" fullWidth variant="standard" value={store.editOrg.memberProvider.token} onChange={evt => runInAction(() => store.editOrg!.memberProvider = {...store.editOrg!.memberProvider, token: evt.currentTarget.value })} />
                    </Box>
                  ) : null}
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Button variant="contained" color="primary" disabled={store.canSave} onClick={() => store.save()}>Save</Button>
        </>
      )}
    </Box>
  );
});

export default observer(({store}: { store: AdminStore }) => {
  const uiStore = React.useMemo(() => new OrgDetailUiStore(store), [store]);
  return (<OrgDetailPage store={uiStore} />);
});