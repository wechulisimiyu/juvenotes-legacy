import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig, targets } from '@adonisjs/core/logger'
import type { LokiOptions } from 'pino-loki'

const loggerConfig = defineConfig({
  default: 'app',

  /**
   * The loggers object can be used to define multiple loggers.
   * By default, we configure only one logger (named "app").
   */
  loggers: {
    app: {
      enabled: true,
      name: env.get('APP_NAME'),
      level: env.get('LOG_LEVEL'),
      transport: {
        targets: targets()
          .pushIf(!app.inProduction, targets.pretty())
          .pushIf(
            app.inProduction && env.get('LOG_TRANSPORT') === 'stdout',
            targets.file({ destination: 1 })
          )
          .pushIf(app.inProduction && env.get('LOG_TRANSPORT') !== 'stdout', {
            target: 'pino-loki',
            options: {
              host: env.get('LOKI_HOST'),
              basicAuth: {
                username: env.get('LOKI_USERNAME'),
                password: env.get('LOKI_PASSWORD'),
              },
              labels: {
                application: env.get('APP_NAME'),
                environment: env.get('NODE_ENV'),
              },
              batching: true,
              interval: 5,
              headers: {
                'X-Scope-OrgID': env.get('LOKI_ORG_ID'),
              },
            } satisfies LokiOptions,
          })
          .toArray(),
      },
      redact: {
        paths: ['password', '*.password'],
      },
    },
    pretty: {
      enabled: true,
      name: 'pretty',
      level: env.get('LOG_LEVEL'),
      transport: {
        targets: targets().push(targets.pretty()).toArray(),
      },
    },
    pino: {
      enabled: true,
      name: 'pino',
      level: env.get('LOG_LEVEL'),
      transport: {
        targets: targets()
          .push(targets.file({ destination: 1 }))
          .toArray(),
      },
    },
  },
})

export default loggerConfig

/**
 * Inferring types for the list of loggers you have configured
 * in your application.
 */
declare module '@adonisjs/core/types' {
  export interface LoggersList extends InferLoggers<typeof loggerConfig> {}
}
