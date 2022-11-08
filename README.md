## Development Environment

### Create dev database
Create a new local database using `sqlite3 server/store.sqlite < server/setup-sqlite.sql`

### To setup HTTPS with the dev client

- (May need WSL on Windows) `openssl req -x509 -newkey rsa:4096 -sha256 -keyout client/dev.key -out client/dev.crt -days 4000 -new -nodes`
- Add `HTTPS=true`, `SSL_CRT_FILE=./dev.crt`, and `SSL_KEY_FILE=./dev.key` to client/.env.local
- Restart `yarn dev:client`

You may be able to skip the certificate and just set `HTTPS=true`, but Firefox doesn't seem to like this config.

## Production Deployment (Azure App Service)
- Configuration setting `SCM_DO_BUILD_DURING_DEPLOYMENT=true`
- Let Github Actions deploy the site