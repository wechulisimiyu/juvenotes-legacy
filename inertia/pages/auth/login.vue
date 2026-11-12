<script setup lang="ts">
import { useForm, usePage, Link } from '@inertiajs/vue3'
import { computed } from 'vue'
import { AlertCircle, Loader } from 'lucide-vue-next'
import AuthLayout from '~/layouts/AuthLayout.vue'

defineOptions({ layout: AuthLayout })

const logoPath = '/images/logo.webp'
const page = usePage()
const restorationMode = computed(() => page.props.restorationMode === true)

defineProps<{
  exceptions: Record<string, string>
}>()

const form = useForm({
  email: '',
  password: '',
  remember: false,
})
</script>

<template>
  <AppHead title="Login" description="Welcome back to Juvenotes" />
  <div class="min-h-[80vh] flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <!-- Card Container -->
      <div class="bg-card rounded-xl shadow-lg p-8 space-y-6">
        <!-- Header -->
        <div class="text-center space-y-2">
          <img :src="logoPath" alt="Juvenotes" class="h-12 mx-auto mb-4" />
          <h1 class="text-2xl font-semibold">Welcome back</h1>
          <p v-if="!restorationMode" class="text-sm text-muted-foreground">
            New to Juvenotes?
            <Link href="/register" class="text-primary hover:underline transition-all">
              Create an account
            </Link>
          </p>
          <p v-else class="text-sm text-muted-foreground" role="status">
            Existing accounts can sign in with a password. Google sign-in, registration and password
            recovery are temporarily unavailable while we restore these services.
          </p>
        </div>

        <!-- Alert -->
        <Alert v-if="exceptions?.E_INVALID_CREDENTIALS" variant="destructive">
          <AlertCircle class="h-4 w-4" />
          <AlertDescription>{{ exceptions.E_INVALID_CREDENTIALS }}</AlertDescription>
        </Alert>

        <!-- Form -->
        <form @submit.prevent="form.post('/login')" class="space-y-4">
          <div class="space-y-4">
            <!-- Email -->
            <div class="space-y-2">
              <Label for="email">Email</Label>
              <Input
                id="email"
                v-model="form.email"
                type="email"
                required
                placeholder="name@example.com"
                :class="{ 'border-destructive': form.errors.email }"
              />
              <p v-if="form.errors.email" class="text-sm text-destructive">
                {{ form.errors.email }}
              </p>
            </div>

            <!-- Password -->
            <div class="space-y-2">
              <Label for="password">Password</Label>
              <Input
                id="password"
                v-model="form.password"
                type="password"
                required
                placeholder="••••••••"
                :class="{ 'border-destructive': form.errors.password }"
              />
              <p v-if="form.errors.password" class="text-sm text-destructive">
                {{ form.errors.password }}
              </p>
            </div>
          </div>

          <!-- Remember & Forgot -->
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <Checkbox id="remember" v-model="form.remember" />
              <Label for="remember" class="text-sm">Remember me</Label>
            </div>
            <Link
              v-if="!restorationMode"
              href="/forgot-password"
              class="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <!-- Submit Button -->
          <Button type="submit" class="w-full" size="lg" :disabled="form.processing">
            <Loader v-if="form.processing" class="mr-2 h-4 w-4 animate-spin" />
            {{ form.processing ? 'Signing in...' : 'Sign in' }}
          </Button>
          <div v-if="!restorationMode" class="relative my-4">
            <div class="absolute inset-0 flex items-center">
              <span class="w-full border-t" />
            </div>
            <div class="relative flex justify-center text-xs uppercase">
              <span class="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button
            v-if="!restorationMode"
            type="button"
            class="w-full bg-card hover:bg-secondary text-foreground font-medium py-3 px-4 border border-border rounded-lg shadow-sm transition-all duration-200 hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50"
          >
            <a href="/auth/google/redirect" class="flex items-center justify-center gap-3">
              <svg class="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span class="text-sm">Continue with Google</span>
            </a>
          </Button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
html:not(.dark) .bg-card {
  background: linear-gradient(to bottom right, rgb(255, 255, 255), rgb(251, 251, 251));
}

html.dark .bg-card {
  background: linear-gradient(to bottom right, hsl(222, 47%, 13%), hsl(222, 47%, 11%));
}
</style>
