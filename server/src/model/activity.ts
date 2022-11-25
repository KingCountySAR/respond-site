import { ActivityRow } from "../db/activityRow";

export default class Activity {
  id: number = 0;
  title: string = '';
  organizationId: number = 0;
  isOpen: boolean = false;
  startTime: number = 0;
  created: number = 0;
  updated: number = 0;

  static fromRow(row: ActivityRow) :Activity {
    let org = Object.assign(
      new Activity(),
      {
        ...JSON.parse(row.properties),
        id: row.id,
        title: row.title,
        organizationId: row.organizationId,
        isOpen: row.isOpen,
        startTime: row.startTime,
        created: row.created,
        updated: row.updated,
      }
    );
    return org;
  }
}