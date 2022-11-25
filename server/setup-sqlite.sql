CREATE TABLE sessions (sid text, session text);
CREATE TABLE organizations (id integer primary key, domain text, properties text not null);
CREATE TABLE activities (id integer primary key, title text,  organizationId integer not null, isOpen integer default 0, startTime integer not null, created integer not null, updated integer not null);
CREATE TABLE orgActivities (activityId integer not null, organizationId integer not null, joinTime integer not null, creator text not null, created integer not null, updated integer not null, primary key (activityId, organizationId));
CREATE TABLE responders (activityId integer not null, organizationId integer not null, joinTime integer not null, endTime integer not null, userId text not null, properties text not null, updated integer not null, primary key (activityId, organizationId, userId, joinTime));

