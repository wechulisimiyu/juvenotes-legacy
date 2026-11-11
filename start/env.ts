/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),
  APP_URL: Env.schema.string({ format: 'url' }),
  APP_DOMAIN: Env.schema.string({ format: 'url' }),
  /*
  |----------------------------------------------------------
  | Variables for configuring session package
  |----------------------------------------------------------
  */
  SESSION_DRIVER: Env.schema.enum(['cookie', 'redis', 'memory'] as const),

  /*
  |----------------------------------------------------------
  | Variables for configuring database connection
  |----------------------------------------------------------
  */
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string(),
  DB_SSL: Env.schema.boolean.optional(),
  DB_SSL_CA: Env.schema.string.optional(),
  LOG_TRANSPORT: Env.schema.enum.optional(['stdout', 'loki'] as const),

  /*
  |----------------------------------------------------------
  | Variables for configuring the mail package
  |----------------------------------------------------------
  */
  MAILGUN_API_KEY: Env.schema.string(),
  MAILGUN_DOMAIN: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring ally package
  |----------------------------------------------------------
  */
  GOOGLE_CLIENT_ID: Env.schema.string(),
  GOOGLE_CLIENT_SECRET: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring the mail package
  |----------------------------------------------------------
  */
  BREVO_API_KEY: Env.schema.string(),
  SMTP_HOST: Env.schema.string(),
  SMTP_PORT: Env.schema.string(),
  SMTP_USERNAME: Env.schema.string(),
  SMTP_PASSWORD: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for statsig
  |----------------------------------------------------------
  */
  STATSIG_CLIENT_KEY: Env.schema.string(),
  STATSIG_SERVER_SECRET: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring Magnify search engine
  |----------------------------------------------------------
  */
  MEILISEARCH_HOST: Env.schema.string({ format: 'host' }),
  MEILISEARCH_API_KEY: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------
  | Variables for Redis
  |----------------------------------------------------------
  */
  REDIS_HOST: Env.schema.string({ format: 'host' }),
  REDIS_PORT: Env.schema.number(),

  MPESA_CONSUMER_SECRET: Env.schema.string(),

  MPESA_CONSUMER_KEY: Env.schema.string(),

  MPESA_PASS_KEY: Env.schema.string(),

  MPESA_BUSINESS_SHORT_CODE: Env.schema.string(),

  MPESA_CALLBACK_URL: Env.schema.string(),

  IDENTITY_SECRET: Env.schema.string(),

  R_2_IP_2_LOCATION_ENDPOINT: Env.schema.string(),

  R_2_SECRET_ACCESS_KEY: Env.schema.string(),

  R_2_ACCESS_KEY_ID: Env.schema.string(),

  POSTHOG_API_KEY: Env.schema.string(),

  POSTHOG_HOST: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring the lock package
  |----------------------------------------------------------
  */
  LOCK_STORE: Env.schema.enum(['redis', 'memory'] as const),

  LOKI_HOST: Env.schema.string(),

  LOKI_USERNAME: Env.schema.string(),

  LOKI_PASSWORD: Env.schema.string(),

  LOKI_ORG_ID: Env.schema.string(),

  APP_NAME: Env.schema.string(),
})
