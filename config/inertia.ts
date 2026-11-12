// import FeatureFlagsDto from '#dtos/feature_flags'
import UserDto from '#dtos/user'
// import { StatsigService } from '#services/statsig'
import { defineConfig } from '@adonisjs/inertia'
import type { InferSharedProps } from '@adonisjs/inertia/types'
import env from '#start/env'

const inertiaConfig = defineConfig({
  /**
   * Path to the Edge view that will be used as the root view for Inertia responses
   */
  rootView: 'inertia_layout',

  /**
   * Data that should be shared with all rendered pages
   */
  sharedData: {
    restorationMode: () => env.get('LEGACY_RESTORE_MODE', false),
    user: async (ctx) => {
      const auth = ctx.auth
      if (!auth) return null

      await auth.use('web').check()
      const user = auth.use('web').user
      return user ? new UserDto(user) : null
    },
    errors: (ctx) => {
      const errors = ctx.session?.flashMessages.get('errors') ?? {}
      return Object.keys(errors).reduce(
        (obj, key) => ({
          ...obj,
          [key]: errors[key].join(', '),
        }),
        {}
      )
    },
    exceptions: (ctx) => ctx.session?.flashMessages.get('errorsBag') ?? {},
    messages: (ctx) => ctx.session?.flashMessages.all() ?? {},
    // features: async (ctx) => {
    //   const user = ctx.auth.use('web').user
    //   if (!user) return null

    //   const flags = await StatsigService.getFeatures(user.id.toString())
    //   return new FeatureFlagsDto(flags)
    // },
  },

  /**
   * Options for the server-side rendering
   */
  ssr: {
    enabled: true,
    entrypoint: 'inertia/app/ssr.ts',

    // Disable SSR for specific pages
    // This is useful for pages that are not compatible with SSR or require client-side only features
    pages(ctx) {
      // Disable SSR for the library/show.vue page
      const component = ctx.request.input('component')
      if (component === 'library/show') {
        return false
      }
      return true
    },
  },
})

export default inertiaConfig

declare module '@adonisjs/inertia/types' {
  export interface SharedProps extends InferSharedProps<typeof inertiaConfig> {}
}
