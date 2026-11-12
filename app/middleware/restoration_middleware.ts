import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import env from '#start/env'

export default class RestorationMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    if (!env.get('LEGACY_RESTORE_MODE', false)) return next()

    const path = request.url()
    if (
      path === '/register' ||
      path.startsWith('/auth/google/') ||
      path === '/forgot-password' ||
      path.startsWith('/forgot-password/')
    ) {
      return response.redirect().toPath('/login')
    }

    if (
      path === '/auth/resend-email' ||
      path === '/settings/account/email' ||
      path.startsWith('/api/payments/') ||
      path === '/test/mpesa'
    ) {
      return response.serviceUnavailable({
        message: 'This service is temporarily unavailable while Juvenotes is being restored.',
      })
    }

    return next()
  }
}
