import { ResponderStatus } from "../src/model/responder";

export interface MyActivityModel {
  id: number,
  idNumber: string,
  title: string,
  isMission: boolean,
  startTime: number,
  status: ResponderStatus,
}

export interface ActivityModel {
  id: number,
  idNumber: string,
  title: string,
  isOpen: boolean,
  isMission: boolean,
  startTime: number,
  totalResponders: number,
  activeResponders: number,
  organization: {
    id: number,
    title: string,
    rosterName?: string,
  },
  roster: {
    name: string,
    joinTime: number,
    endTime?: number,
    status: ResponderStatus,
    organization: {
      id: number,
      rosterName?: string,
    }
  }[]
}

export interface OrgActivityModel extends ActivityModel {
  joinTime: number,
  unitResponders: number,
  activeUnitResponders: number,
}

export default ActivityModel;