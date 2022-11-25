import { DbWrapper } from "./dbBuilder";
import { OrganizationRepo } from "./organizationRepo";

export default class Repository {
  readonly db: DbWrapper;
  readonly organizations: OrganizationRepo;

  constructor(db: DbWrapper) {
    this.db = db;
    this.organizations = new OrganizationRepo(db);
  }

}