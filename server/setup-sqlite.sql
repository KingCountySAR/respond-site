CREATE TABLE sessions (sid text, session text);
CREATE TABLE organizations (id integer primary key, domain text, properties text not null);
CREATE TABLE activities (id integer primary key, title text, organizationId integer not null, isMission integer not null, isOpen integer not null, startTime integer not null, properties text not null, created integer not null, updated integer not null);
CREATE TABLE orgActivities (activityId integer not null, organizationId integer not null, joinTime integer not null, creator text not null, created integer not null, updated integer not null, primary key (activityId, organizationId));
CREATE TABLE responders (activityId integer not null, organizationId integer not null, userId text not null, joinTime integer not null, endTime integer, [status] integer not null, properties text not null, updated integer not null, primary key (activityId, organizationId, userId, joinTime));

