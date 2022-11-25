import { ActivityRow } from "./activityRow";
import { DbWrapper } from "./dbBuilder";
import { ResponderRow } from "./responderRow";

export class ActivitiesRepo {
  private db: DbWrapper;

  constructor(db: DbWrapper) {
    this.db = db;
  }

  async get(id: number) :Promise<ActivityRow> {
    return await this.db.knex.table(this.db.t('activities')).where('id', id).first();
  }

  async getCurrentForOrg(organizationId: number) :Promise<(ActivityRow & {joinTime:number,totalResponders:number,unitResponders:number})[]> {
    const rows = await this.db.knex
      .select(
        'a.*',
        'oa.joinTime',
        'r.totalResponders',
        'r.unitResponders',
        'r.activeResponders',
        'r.activeUnitResponders',
      )
      .from(`${this.db.t('activities')} as a`)
      .leftJoin(`${this.db.t('orgActivities')} as oa`, 'a.id', 'oa.activityId')
      .leftJoin(this.db.knex.select('activityId')
                            .count({ totalResponders: this.db.knex.raw('1')})
                            .sum({ activeResponders: this.db.knex.raw(`iif(status=2 or status=3, 1, 0)`)})
                            .sum({ unitResponders: this.db.knex.raw(`iif(organizationId=${organizationId},1,0)`)})
                            .sum({ activeUnitResponders: this.db.knex.raw(`iif(organizationId=${organizationId} and (status=2 or status=3),1,0)`)})
                            .from(this.db.t('responders'))
                            .groupBy('activityId')
                            .as('r'), 'a.id', 'r.activityId')
      .where('oa.organizationId', organizationId)
      .orderBy('startTime', 'desc')

    return rows;
  }

  async getResponders(activityId: number) :Promise<ResponderRow[]> {
    const rows = (await this.db.knex
      .from(this.db.t('responders'))
      .where('activityId', activityId));

    return rows;
  }

  async getMyActivities(userId: string) {
    const rows = await this.db.knex
    .select(
      'a.*',
      'r.joinTime',
      'r.endTime',
      'r.status',
    )
      .from(`${this.db.t('responders')} as r`)
      .leftJoin(`${this.db.t('activities')} as a`, 'r.activityId', 'a.id')
      .where('r.userId', userId)
      .orderBy([
        { column: 'a.isMission', order: 'desc' },
        { column: 'a.startTime', order: 'desc' },
      ]);

    return rows;
  }
}