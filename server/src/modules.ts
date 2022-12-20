import { AuthData } from "./api/apiUtils";

declare module 'express-session' {
  export interface SessionData {
    auth: AuthData
  }
}
