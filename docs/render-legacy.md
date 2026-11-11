# Temporary Render deployment

This branch restores the existing platform while Jonathan's rebuild continues
in `daktarionline/juvenotes`. Deploy this branch without merging it into the
rebuild or changing that project's database.

Deployment source: `wechulisimiyu/juvenotes-legacy`, branch
`deploy/render-legacy`, forked from `juvenotes/web`.

## Provisioned target

- Supabase organization: `juvenotes`
- Project: `juvenotes-legacy` (`nhxrdfuogclawvexxvjs`), Singapore, Free
- Render web service: form prepared for Free Docker, Singapore, manual deploys;
  the service has not yet been created
- Render cache: `juvenotes-legacy-cache` (`red-dbq476tg1s2s73bvqu2g`), Free,
  Singapore, internal host `red-dbq476tg1s2s73bvqu2g`, port `6379`;
  external connections blocked
- Render health check: `/healthz`

## Verified restoration: 11 November 2026

The database has been restored into the dedicated Supabase project. All 49
application tables and 342,247 source rows matched an independent native COPY
restore, including complete per-table content fingerprints. The restored
database is approximately 77 MiB, with 1,828 users and 14,586 questions.

The source had 81 Lucid migrations. The one pending migration,
`1768129805053_create_add_session_tracking_columns_table`, has now been applied
and recorded, bringing the history to 82. It adds nullable session tracking
columns and an index; existing application records remain intact.

Every application table has RLS enabled. `anon` and `authenticated` have no
usage privilege on the application schema. The separate `juvenotes_app` login
has data privileges and a backend-only RLS policy, with no schema creation
privilege. Supabase's security advisors reported no findings after restoration.

Local checks using the production build and restored database passed:

- `/healthz`: HTTP 200 with database connected.
- Homepage and login page: HTTP 200.
- Guest access to concepts: redirected to login.
- Email/password login with a temporary local account: redirected to `/learn`.
- Authenticated concepts: HTTP 200.

The temporary test account existed only in the local test database and was
removed afterwards. The original backup was not modified.

The website is not deployed yet. Supabase's dashboard is signed out, so its
actual session-pooler address and root certificate remain to be copied. The
original container environment export has not been supplied. Cloudflare,
which serves the domain's DNS, is also at its sign-in screen. DNS has not changed.

## Restore before cutover

The correct backup is `juvenotes-postgres.sql.gz`, from droplet `demo-ae` at the
1 November 2026 DigitalOcean shutdown. Its SHA-256 is
`445020714321684c78c60bef81aee0ea0b5065dfaf0d363a2b3edcb059f06639`.
The associated README identifies it as `pg_dumpall` of the live database.
Extract only `juvenotes_restore`; do not execute its cluster-wide role or
database creation statements against Supabase. This supersedes the older
July backup previously suggested for this deployment.

1. Keep the original dump unchanged and record its SHA-256 checksum.
2. Restore into an isolated local Postgres database first. Inspect table sizes,
   foreign keys, extensions, applied Lucid migrations, and media URL hosts.
3. Confirm the database including indexes fits the Supabase Free allowance.
4. Restore only application objects into the dedicated project. Exclude original
   ownership and grants; never restore Supabase's managed schemas or run a
   cluster-wide clean. Revoke Data API access to application tables before
   importing user data. Use a separate backend database role.
5. Compare source and destination row counts, content and sequence values.
   Source figures are 1,828 users and 14,586 questions; the source has 342,247
   rows across 49 tables before the additional migration history entry.
6. Compare the restored migration history with this branch before applying
   outstanding migrations. Never run seeders over restored production data.

Use the project's actual connection details from Supabase's Connect dialog.
For an IPv4-only app host use the session pooler; restore through a direct
connection where available, or a documented compatible session connection.

## Runtime configuration

Use Render's environment-variable controls for secrets. Do not commit a
production `.env`, passwords, API keys, or backups.

| Setting                                                       | Value                                                           |
| ------------------------------------------------------------- | --------------------------------------------------------------- |
| `NODE_ENV`                                                    | `production`                                                    |
| `HOST`                                                        | `0.0.0.0`                                                       |
| `PORT`                                                        | Render's assigned port, normally `10000`                        |
| `APP_NAME`                                                    | `Juvenotes`                                                     |
| `APP_URL`, `APP_DOMAIN`                                       | Initial Render URL; change to the custom domain at cutover      |
| `APP_KEY`                                                     | Recover the original production key where available             |
| `SESSION_DRIVER`                                              | `cookie`                                                        |
| `LOCK_STORE`                                                  | `memory` for a single instance                                  |
| `LOG_LEVEL`                                                   | `info`                                                          |
| `LOG_TRANSPORT`                                               | `stdout`                                                        |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE` | Dedicated Supabase backend connection                           |
| `DB_SSL`                                                      | `true`                                                          |
| `DB_SSL_CA`                                                   | Supabase CA certificate when required; literal `\n` is accepted |

Certificate verification remains enabled. Recover the remaining integration
configuration required by `start/env.ts`; do not treat dummy credentials as a
working integration. In particular, check Redis-dependent login and caches,
Brevo delivery, Google OAuth callbacks, Cloudinary media, and Meilisearch.
Use Brevo's HTTPS transport because Render Free blocks SMTP ports. Confirm
whether delayed email delivery has a running worker before promising it works.

## Verification and handover

- Build with the pinned pnpm version and frozen lockfile.
- Confirm `/healthz` returns 200 with a working database and 503 if the database
  is unreachable. The response must contain no connection details or user data.
- Verify homepage totals, login, a concept, a quiz, saved progress, and images.
- Restart the service and verify persisted data and cookie sessions.
- Check password reset and OAuth separately, with approved test accounts.
- Change DNS only after the Render deployment passes these checks; preserve
  existing email and other unrelated DNS records.

After successful deployment, configure an external HTTP probe every 10 minutes
with failure notifications. One continuously running web service uses at most
744 of the workspace's 750 Free instance hours in a 31-day month. Other free
web services share that allowance. Probes cannot guarantee availability.
Watch the workspace's 5 GB bandwidth and 500 build-minute allowances as well.

Supabase Free does not include automatic backups. Set up encrypted exports
outside the running service and verify a restore before relying on them.
Supabase inactivity pausing is a separate availability constraint: an external
monitor should report failed database health checks rather than assuming the
Render probe guarantees database availability.
