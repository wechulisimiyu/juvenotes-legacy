# Temporary Render deployment

This branch restores the existing platform while Jonathan's rebuild continues
in `daktarionline/juvenotes`. Deploy this branch without merging it into the
rebuild or changing that project's database.

## Provisioned target

- Supabase organization: `juvenotes`
- Project: `juvenotes-legacy` (`nhxrdfuogclawvexxvjs`), Singapore, Free
- Render: one Free Docker web service, Singapore, manual deploys
- Render health check: `/healthz`

The Render service is not created by this document. Finish configuration after
the backup is available and the restore passes validation.

## Restore before cutover

The previously validated Coolify database backup is named
`data_coolify_backups_databases_root-team-0_juvenotes-web-1-t4sss4kw44gwoocw4kkkgogw_pg-dump-postgres-1781200807.dmp`.
It was recorded on the owner's Mac Desktop, not in this checkout. Obtain the
actual file and inspect its archive contents with `pg_restore --list` before
running any restore commands. This is the application backup, not `coolify-db`.

1. Keep the original dump unchanged and record its SHA-256 checksum.
2. Restore into an isolated local Postgres database first. Inspect table sizes,
   foreign keys, extensions, applied Lucid migrations, and media URL hosts.
3. Confirm the database including indexes fits the Supabase Free allowance.
4. Restore only application objects into the dedicated project. Exclude original
   ownership and grants; never restore Supabase's managed schemas or run a
   cluster-wide clean. Revoke Data API access to application tables before
   importing user data. Use a separate backend database role.
5. Compare source and destination row counts and sequence values. Historical
   comparison figures were 1,753 users and 14,586 questions; the actual supplied
   dump is authoritative.
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
