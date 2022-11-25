import { Request, Response } from 'express';
import { Logger } from 'winston';
import Repository from '../db/repository';

export interface AuthData {
  email: string,
  name?: string,
  hd?: string,
  picture?: string,
  userId: string,
  organizationId: number,
}

export function userFromAuth(ticket?: AuthData) {
  if (!ticket) return undefined;
  return {
    name: ticket.name,
    email: ticket.email,
    domain: ticket.hd,
    picture: ticket.picture,
  }
}

export async function catchErrors(res: Response, log:Logger, action: () => Promise<void>) {
  try {
    await action();
  } catch (err) {
    log.error(err);
    res.status(500).json({ message: err });
  }
}

export async function organizationFromReq(req: Request, repo: Repository) {
  const domain = (process.env.environment === 'prod' ? req.hostname : (req.headers['x-forwarded-host'] as string ?? req.hostname)).split(':')[0];
  return repo.organizations.getFromDomain(domain);
}