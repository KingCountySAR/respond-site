import { createContext } from "react";
import { Location, Params } from 'react-router-dom';
import UserViewModel from "./userViewModel";

export interface AppChrome {
  readonly user?: UserViewModel,
  syncRoute: (location: Location, params?: Params<string>) => void,
  doLogout: () => Promise<void>,
}

export const AppChromeContext = createContext<AppChrome|undefined>(undefined);