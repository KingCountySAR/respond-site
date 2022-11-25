import { ResponderStatus } from "../model/responder";

export interface ResponderRow {
  activityId: number,
  organizationId: number,
  userId: string,
  joinTime: number,
  endTime?: number,
  status: ResponderStatus,
  properties: string,
  updated: number,
}