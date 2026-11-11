import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class HealthController {
  async handle({ response }: HttpContext) {
    response.header('Cache-Control', 'no-store')

    try {
      await db.rawQuery('select 1').timeout(3000)
      return response.ok({ status: 'ok' })
    } catch {
      return response.serviceUnavailable({ status: 'unavailable' })
    }
  }
}
