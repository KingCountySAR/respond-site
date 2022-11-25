import { ActivitiesRepo } from "./activitiesRepo";
import { DbWrapper } from "./dbBuilder";
import { OrganizationRepo } from "./organizationRepo";

export default class Repository {
  readonly db: DbWrapper;
  readonly organizations: OrganizationRepo;
  readonly activities: ActivitiesRepo;

  constructor(db: DbWrapper) {
    this.db = db;
    this.organizations = new OrganizationRepo(db);
    this.activities = new ActivitiesRepo(db);
  }

}