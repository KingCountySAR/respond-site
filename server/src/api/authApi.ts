import { Express } from 'express';
// import { OAuth2Client } from 'google-auth-library';
// import WorkspaceClient from '../googleWorkspace';

export interface AuthData {
  email: string,
  name?: string,
  hd?: string,
  picture?: string,
}

declare module 'express-session' {
  export interface SessionData {
    auth: AuthData
  }
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


export function addAuthApi(app: Express/*, authClient: OAuth2Client, workspaceClient: WorkspaceClient*/) {
  // app.post("/api/auth/google", async (req, res) => {
  //   const { token } = req.body;
  //   console.log('CLIENT_ID', token, process.env.CLIENT_ID)
  //   const ticket = await authClient.verifyIdToken({
  //     idToken: token,
  //     audience: process.env.CLIENT_ID
  //   });

  //   const payload = ticket.getPayload();
  //   if (!payload) {
  //     res.status(500).json({message: 'Could not get ticket'});
  //     return;
  //   }
  //   if (!payload.email) {
  //     res.status(500).json({message: 'Could not get user email'});
  //     return;
  //   }

  //   if ((process.env.ALLOWED_DOMAINS?.split(',')?.indexOf(payload.hd ?? '') ?? 0) < 0) {
  //     console.log(`${payload.email} from domain ${payload.hd} not allowed`)
  //     res.status(403).json({error: 'User not from allowed Google domain' })
  //     return;
  //   }

  //   const member = await workspaceClient.getUserFromEmail(payload.email);

  //   console.log(`got member ${member.orgUnitPath}`)
  //   req.session.auth = {
  //     email: payload.email,
  //     ...payload,
  //   };
  //   console.log(`Logged in ${payload.email}`);
  //   res.status(200);
  //   res.json(userFromAuth(req.session.auth));
  // })

  app.post('/api/auth/logout', (req, res) => {
    req.session?.destroy(err => {
      if (err) {
        res.status(400).json({ error: 'Unable to log out' })
      } else {
        res.json({ msg: 'Logout successful' })
      }
    });
  })
}