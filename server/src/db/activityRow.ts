export interface ActivityRow {
  id: number,
  title: string,
  organizationId: number,
  isOpen: boolean,
  isMission: boolean,
  startTime: number,
  properties: string,
  created: number,
  updated: number,
}