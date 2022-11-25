import { ResponderRow } from "../db/responderRow";

export enum ResponderStatus {
  Unavailable = 0,
  Standby = 2,
  Responding = 3,
  Cleared = 4,
}

export default interface Responder {
  activityId: number;
  organizationId: number;
  userId: string;
  joinTime: number;
  endTime?: number;
  status: ResponderStatus;
  updated: number;

  name: string;
  idNumber?: string;
}