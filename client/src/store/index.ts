import { createTheme } from '@mui/material';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { Location, Params } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import Api from './api';
import LoginModel, { LoginResult } from '../../../server/api-models/loginModel';
import UserViewModel, { loginToViewModel } from '../models/userViewModel';
import { AppChrome } from '../models/appChromeContext';
import { CredentialResponse } from '@react-oauth/google';
import { SiteConfig } from '../../../server/api-models/siteConfig';

class Store implements AppChrome {
  @observable route: { location: Location, params?: Params<string> } = { location: {
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    key: '',
    state: null
  } };

  @observable history = createBrowserHistory();

  @observable started: boolean = false;
  @observable user?: UserViewModel;
  @observable loginError?: string;

  @observable config: SiteConfig = { clientId: '' };

  constructor() {
    makeObservable(this);
  }

  async start() {
    const response = await Api.get<{config: SiteConfig, user: LoginResult}>('/api/session');
    runInAction(() => {
      this.config = response.config as SiteConfig;
      this.user = loginToViewModel(response.user);
      this.started = true;
    });
  }

  @action.bound
  async doLogin(data?: CredentialResponse) {
    if (!data || !data.credential) {
      alert('login error');
    } else {
      const res = await Api.post<LoginModel>('/api/auth/google', { token: data.credential });

      runInAction(() => {
        if (res.error) {
          this.loginError = res.error;
          this.user = undefined;
          alert(this.loginError);
        } else {
          console.log('Logging in', res);
          this.user = loginToViewModel(res as LoginResult);
        }
      });
    }
  }

  @action.bound
  async doLogout() {
    if (!this.user) return;
    
    await Api.get<{}>('/api/auth/logout', {
      method: 'POST',
      mode: 'same-origin', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify({})
    });

    runInAction(() => this.user = undefined);
  }

  @action.bound
  syncRoute(location: Location, params?: Params<string>) {
    this.route = ({ location, params });
  }

  @computed
  get theme() {
    const t = (
      {
        palette: {
          primary: { main: 'rgb(100, 100, 100)' },
        },
      }
    );
    return createTheme(t);
  }
}

export default Store;
