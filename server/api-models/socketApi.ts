import { LoginResult } from "./loginModel";
import { SiteConfig } from "./siteConfig";

export interface SessionState {
  config: SiteConfig,
  user: LoginResult,
}

export interface ServerToClientEvents {
  //welcome: (state: SessionState) => void;
  welcome: (info: string) => void;
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
}

export interface ClientToServerEvents {
  hello: () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  name: string;
  age: number;
}