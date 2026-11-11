/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { Route } from '@adonisjs/core/http'
import { middleware } from './kernel.js'
import transmit from '@adonisjs/transmit/services/main'

router.get('/healthz', [() => import('#controllers/health_controller'), 'handle'])

const HomeController = () => import('#controllers/home/home_controller')
const SupportController = () => import('#controllers/home/support_controller')
const LoginController = () => import('#controllers/auth/login_controller')
const LogoutController = () => import('#controllers/auth/logout_controller')
const RegisterController = () => import('#controllers/auth/register_controller')
const GoogleSignupController = () => import('#controllers/auth/google_signup_controller')
const EmailVerificationsController = () => import('#controllers/auth/email_verification_controller')
const ForgotPasswordController = () => import('#controllers/auth/forgot_password_controller')
const ProfileController = () => import('#controllers/settings/profile_controller')
const AccountController = () => import('#controllers/settings/account_controller')
const InstitutionsController = () => import('#controllers/manage/institutions_controller')
const CoursesController = () => import('#controllers/manage/courses_controller')
const IndexConceptsController = () => import('#controllers/concepts/index_concepts_controller')
const ManageConceptsController = () =>
  import('#controllers/manage/concepts/manage_concepts_controller')
const IndexPapersController = () => import('#controllers/papers/index_papers_controller')
const UserDashboardController = () => import('#controllers/dashboard/learner_dashboard_controller')
const ManagePapersController = () =>
  import('#controllers/manage/past_papers/manage_papers_controller')
const ManagementDashboardController = () =>
  import('#controllers/manage/dashboard/manage_dashboard_controller')
const ManageUsersController = () => import('#controllers/manage/users/manage_users_controller')
const UploadImageController = () => import('#controllers/api/upload_image_controller')
const IndexOsceController = () => import('#controllers/osce/osce_controller')
const ManageOsceController = () => import('#controllers/manage/osce/manage_osce_controller')
const CiteController = () => import('#controllers/api/cite_controller')
const QuestionFeedbackController = () => import('#controllers/papers/question_feedback_controller')
const ManageFeedbackController = () =>
  import('#controllers/manage/feedback/manage_feedback_controller')
const ManageTodayController = () => import('#controllers/manage/today/manage_today_controller')
const IndexTodayController = () => import('#controllers/today/index_today_controller')
const ManageSpotController = () => import('#controllers/manage/spot/manage_spot_controller')
const IndexSpotController = () => import('#controllers/spot/index_spot_controller')
const PaymentsController = () => import('#controllers/payments_controller')
const SessionsController = () => import('#controllers/session_controller')
const UserProgressController = () => import('#controllers/user_progress_controller')
const StudyTimeController = () => import('#controllers/study_time_controller/study_time_controller')
const ManageConceptSectionController = () =>
  import('#controllers/manage/concepts/manage_concept_section_controller')
const OnboardingController = () => import('#controllers/onboarding_controller')
const MedicalArticleController = () => import('#controllers/medical_articles_controller')
const MediaAssetsController = () => import('#controllers/media_assets_controller')
const IndexEventsController = () => import('#controllers/events/index_events_controller')
const ManageEventsController = () => import('#controllers/manage/events/manage_events_controller')
const EventQuizzesController = () => import('#controllers/manage/events/event_quizzes_controller')

transmit.registerRoutes((route) => {
  // Ensure you are authenticated to register your client
  if (route.getPattern() === '__transmit/events') {
    route.middleware(middleware.auth())
    return
  }
})

//* METRICS (/manage/metrics, see config/prometheus.ts)
// The /metrics route is registered by the prometheus provider before this
// file runs. Guard it here so only admins can read it, and refuse to boot
// if it can't be found rather than leaving it exposed.
const metricsRoute = router.routes.find(
  (route): route is Route => route instanceof Route && route.getName() === 'prometheus.metrics'
)
if (!metricsRoute) {
  throw new Error('prometheus.metrics route not found; refusing to boot with an unguarded endpoint')
}
metricsRoute.use([middleware.auth(), middleware.admin()])

// test crash route
router.get('/crash', () => {
  throw new Error('Test 500 error')
})

//* HOME
router.get('/', [HomeController, 'index']).as('home')

//* SUPPORT
router.get('/support', [SupportController, 'index']).as('support')

//* AUTH -> LOGIN, REGISTER, LOGOUT
router.get('/login', [LoginController, 'show']).as('auth.login.show').use(middleware.guest())
router.post('/login', [LoginController, 'store']).as('auth.login.store').use([middleware.guest()])
router
  .get('/register', [RegisterController, 'show'])
  .as('auth.register.show')
  .use(middleware.guest())
router
  .post('/register', [RegisterController, 'store'])
  .as('auth.register.store')
  .use([middleware.guest()])
router.post('/logout', [LogoutController, 'handle']).as('auth.logout').use(middleware.auth())

//* AUTH -> VERIFY EMAIL
router.get('/auth/verify', [EmailVerificationsController, 'pending'])
router.get('/auth/verify-email/:token', [EmailVerificationsController, 'verify'])
router
  .post('/auth/resend-email', [EmailVerificationsController, 'resend'])
  .as('verification.resend')

//* AUTH -> FORGOT PASSWORD
router
  .get('/forgot-password', [ForgotPasswordController, 'index'])
  .as('auth.password.index')
  .use([middleware.guest()])
router
  .post('/forgot-password', [ForgotPasswordController, 'send'])
  .as('auth.password.send')
  .use([middleware.guest()])
router
  .get('/forgot-password/reset/:value', [ForgotPasswordController, 'reset'])
  .as('auth.password.reset')
  .use([middleware.guest()])
router
  .post('/forgot-password/reset', [ForgotPasswordController, 'update'])
  .as('auth.password.update')
  .use([middleware.guest()])

//* TERMS AND PRIVACY
const TermsController = () => import('#controllers/legal/terms_controller')
const PrivacyController = () => import('#controllers/legal/privacy_controller')

//* USER DASHBOARD
router
  .get('learn', [UserDashboardController, 'handle'])
  .as('learn')
  .use([middleware.auth(), middleware.onboarding()])

//* SETTINGS -> ACCOUNT
router
  .get('/settings/account', [AccountController, 'index'])
  .as('settings.account')
  .use(middleware.auth())
router
  .put('/settings/account/email', [AccountController, 'updateEmail'])
  .as('settings.account.email')
  .use(middleware.auth())
router
  .delete('/settings/account', [AccountController, 'destroy'])
  .as('settings.account.destroy')
  .use(middleware.auth())

//* SETTINGS -> PROFILE
router
  .get('/settings/profile', [ProfileController, 'index'])
  .as('settings.profile')
  .use(middleware.auth())
router
  .put('/settings/profile', [ProfileController, 'update'])
  .as('settings.profile.update')
  .use(middleware.auth())

// SESSION LOGS
router
  .group(() => {
    router.delete('/sessions/:id', [SessionsController, 'destroy']).as('sessions.destroy')
    router.delete('/sessions', [SessionsController, 'destroy']).as('sessions.destroy.all')
  })
  .use(middleware.auth())

//* CONCEPTS -> VIEW
router.get('/concepts', [IndexConceptsController, 'index']).use(middleware.auth())
router.get('/concepts/:slug', [IndexConceptsController, 'show']).use(middleware.auth())

//* MANAGEMENT DASHBOARD - ADMIN
router
  .group(() => {
    router.get('/', [ManagementDashboardController, 'index'])
  })
  .prefix('/manage')
  .use(middleware.auth())

// * CONCEPTS -> MANAGE
router
  .group(() => {
    router.get('/', [ManageConceptsController, 'index'])
    router.get('/:slug', [ManageConceptsController, 'show'])
    router.post('/', [ManageConceptsController, 'store'])
    router.put('/:slug', [ManageConceptsController, 'update'])
    router.put('/:slug/content', [ManageConceptsController, 'updateContent'])
    router.post('/:slug/questions/mcq', [ManageConceptsController, 'addMcq'])
    router.put('/:conceptSlug/questions/:questionSlug/mcq', [ManageConceptsController, 'updateMcq'])
    router.delete('/:conceptSlug/questions/:questionSlug', [ManageConceptsController, 'deleteMcq'])
    router.delete('/:slug', [ManageConceptsController, 'destroy'])
  })
  .prefix('/manage/concepts')
  .use(middleware.auth())

router
  .group(() => {
    // Get sections for a concept
    router.get('/concepts/:conceptSlug/:sectionSlug([^/]+(?:#[a-z]+)?)', [
      ManageConceptSectionController,
      'index',
    ])

    // Create a new section
    router.post('/concepts/sections', [ManageConceptSectionController, 'store'])

    // Get single section
    router.get('/concepts/sections/:id', [ManageConceptSectionController, 'show'])

    // Update a section
    router.put('/concepts/sections/:id', [ManageConceptSectionController, 'update'])

    // Delete a section (with optional query param ?deleteChildren=true)
    router.delete('/concepts/sections/:id', [ManageConceptSectionController, 'destroy'])
  })
  .prefix('/manage')
  .use(middleware.auth())

//* AUTH -> GOOGLE
router
  .group(() => {
    router.get('/redirect', [GoogleSignupController, 'redirect'])
    router.get('/callback', [GoogleSignupController, 'handleCallback'])
  })
  .prefix('/auth/google')
  .use(middleware.guest())

//* PAST PAPERS -> VIEW
router.get('/papers', [IndexPapersController, 'index']).use(middleware.auth())
router.get('/papers/:slug', [IndexPapersController, 'show']).use(middleware.auth())
router
  .get('/papers/:conceptSlug/:paperSlug', [IndexPapersController, 'view'])
  .use(middleware.auth())
router
  .post('/api/papers/record-mcq-response', [IndexPapersController, 'recordMcqResponse'])
  .use(middleware.auth())
router
  .post('/api/papers/record-saq-response', [IndexPapersController, 'recordSaqResponse'])
  .use(middleware.auth())
router
  .post('/api/papers/record-osce-response', [IndexPapersController, 'recordOsceResponse'])
  .use(middleware.auth())
router
  .get('/api/papers/:paperId/my-responses', [IndexPapersController, 'getMyResponses'])
  .use(middleware.auth())
router
  .post('/api/papers/add-mcq-question', [
    () => import('#controllers/api/papers_controller'),
    'addMcqQuestion',
  ])
  .use(middleware.auth())

// LEGAL -> TERMS
router.get('/terms', [TermsController, 'handle']).as('legal.terms')
router.get('/privacy', [PrivacyController, 'handle']).as('legal.privacy')

//* PAST PAPERS -> MANAGE
router
  .group(() => {
    router.get('/', [ManagePapersController, 'index'])
    router.get('/:slug', [ManagePapersController, 'show'])
    router.get('/:conceptSlug/:paperSlug', [ManagePapersController, 'viewPaper'])
    router.post('/', [ManagePapersController, 'store'])
    router.post('/:conceptSlug/:paperSlug/questions/mcq', [
      ManagePapersController,
      'addMcqQuestion',
    ])
    router.post('/:conceptSlug/:paperSlug/questions/saq', [
      ManagePapersController,
      'addSaqQuestion',
    ])
    router.post('/:conceptSlug/:paperSlug/questions/mcq/upload', [
      ManagePapersController,
      'uploadMcqs',
    ])
    router.put('/:conceptSlug/:paperSlug/questions/:questionSlug/mcq', [
      ManagePapersController,
      'updateMcq',
    ])

    router.put('/:conceptSlug/:paperSlug/questions/:questionSlug/saq', [
      ManagePapersController,
      'updateSaq',
    ])
    router.post('/questions/copy-to-quiz', [ManagePapersController, 'copyQuestionToQuiz'])
    router.put('/:conceptSlug/:paperSlug', [ManagePapersController, 'update'])
    router.delete('/:conceptSlug/:paperSlug/questions/:questionSlug', [
      ManagePapersController,
      'deleteQuestion',
    ])
    router.delete('/:conceptSlug/:paperSlug', [ManagePapersController, 'destroy'])
  })
  .prefix('/manage/papers')
  .use(middleware.auth())

router
  .group(() => {
    router.get('/users', [ManageUsersController, 'index'])
    router.put('/users/:id/role', [ManageUsersController, 'updateRole'])
  })
  .prefix('/manage')
  .use(middleware.auth())

//* CONCEPTS -> SEARCH
router.get('/api/concepts/search', [IndexConceptsController, 'search']).use(middleware.auth())
// router
//   .get('/api/concepts/recent-searches', [IndexConceptsController, 'recentSearches'])
//   .use(middleware.auth())
// router.get('/api/concepts/store-selected-concept', [
//   IndexConceptsController,
//   'storeSelectedConcept',
// ])

//* MANAGE CONCEPTS -> SEARCH
router
  .get('/api/manage/concepts/search', [ManageConceptsController, 'search'])
  .use(middleware.auth())
// router
//   .get('/api/manage/concepts/recent-searches', [ManageConceptsController, 'recentSearches'])
//   .use(middleware.auth())
// router
//   .get('/api/manage/concepts/store-selected-concept', [
//     ManageConceptsController,
//     'storeSelectedConcept',
//   ])
//   .use(middleware.auth())

//* UPLOAD IMAGE -> CLOUDINARY
router.post('/api/upload-image', [UploadImageController, 'store']).use(middleware.auth())
router
  .get('/test/upload', ({ inertia }) => {
    return inertia.render('test/upload')
  })
  .use(middleware.auth())

//* MANAGE INSTITUTIONS
router
  .group(() => {
    router.get('/', [InstitutionsController, 'index'])
    router.get('/:id', [InstitutionsController, 'show'])
    router.post('/', [InstitutionsController, 'store'])
    router.put('/:id', [InstitutionsController, 'update'])
    router.put('/:id/courses', [InstitutionsController, 'updateCourses'])
    router.delete('/:id', [InstitutionsController, 'destroy'])
  })
  .prefix('/manage/institutions')
  .use(middleware.auth())

//* MANAGE COURSES
router
  .group(() => {
    router.get('/', [CoursesController, 'index'])
    router.get('/:id', [CoursesController, 'show'])
    router.post('/', [CoursesController, 'store'])
    router.put('/:id', [CoursesController, 'update'])
    router.delete('/:id', [CoursesController, 'destroy'])
  })
  .prefix('/manage/courses')
  .use(middleware.auth())

//* OSCE: VIEW
router
  .group(() => {
    router.get('/', [IndexOsceController, 'index'])
    router.get('/:slug', [IndexOsceController, 'show'])
    router.get('/:conceptSlug/:paperSlug', [IndexOsceController, 'viewPaper'])
  })
  .prefix('/osce')
  .use(middleware.auth())

//* OSCE: MANAGE
router
  .group(() => {
    router.get('/', [ManageOsceController, 'index'])
    router.get('/:slug', [ManageOsceController, 'show'])
    router.get('/:conceptSlug/:paperSlug', [ManageOsceController, 'viewOscePaper'])
    router.post('/', [ManageOsceController, 'store'])
    router.post('/:conceptSlug/:paperSlug/questions', [ManageOsceController, 'addQuestion'])
    router.put('/:conceptSlug/:paperSlug/questions/:questionSlug/osce', [
      ManageOsceController,
      'updateQuestion',
    ])
    router.delete('/:conceptSlug/:paperSlug/questions/:questionSlug', [
      ManageOsceController,
      'deleteQuestion',
    ])
    router.patch('/:paperSlug', [ManageOsceController, 'update'])
    router.delete('/:conceptSlug/:paperSlug', [ManageOsceController, 'destroy'])
  })
  .prefix('/manage/osce')
  .use(middleware.auth())

//* CITE -> CITATION_JS
router.post('/api/cite', [CiteController, 'store']).use(middleware.auth())
router
  .get('/test/cite', ({ inertia }) => {
    return inertia.render('test/cite')
  })
  .use(middleware.auth())

// Question Feedback Routes
router.post('/questions/:id/feedback', [QuestionFeedbackController, 'store']).use(middleware.auth())

router.get('/manage/feedback', [ManageFeedbackController, 'index']).use(middleware.auth())
router
  .post('/manage/feedback/:id/resolve', [ManageFeedbackController, 'markAsResolved'])
  .use(middleware.auth())
router
  .post('/api/feedback/:id/resolve', [ManageFeedbackController, 'markAsResolved'])
  .use(middleware.auth())

// Show a single question (by slug) with all related feedback
router
  .get('/manage/feedback/question/:slug', [ManageFeedbackController, 'showQuestion'])
  .use(middleware.auth())

// MCQ Choice
router.patch('/api/manage/mcq-choices/:id', [ManageFeedbackController, 'updateMcqChoice'])
// SAQ Part
router.patch('/api/manage/saq-parts/:id', [ManageFeedbackController, 'updateSaqPart'])
// OSCE Station
router.patch('/api/manage/osce-stations/:id', [ManageFeedbackController, 'updateOsceStation'])
// Spot Station
router.patch('/api/manage/spot-stations/:id', [ManageFeedbackController, 'updateSpotStation'])
// Question Stem
router.patch('/api/manage/questions/:id', [ManageFeedbackController, 'updateQuestionStem'])

// Quiz API routes
router
  .get('/api/events/:slug/quiz/:quizId/leaderboard', [
    ManageEventsController,
    'showQuizLeaderboard',
  ])
  .use(middleware.auth())
router
  .put('/api/events/:slug/quiz/:quizId/stats', [ManageEventsController, 'updateQuizStats'])
  .use(middleware.auth())
router
  .post('/api/events/:slug/quiz/:quizId/answer', [IndexEventsController, 'submitQuizAnswer'])
  .use(middleware.auth())

// Quiz Session API routes
router
  .post('/api/events/:slug/quiz/:quizId/session/start', [IndexEventsController, 'startQuizSession'])
  .use(middleware.auth())
router
  .post('/api/events/:slug/quiz/:quizId/session/activity', [
    IndexEventsController,
    'recordSuspiciousActivity',
  ])
  .use(middleware.auth())
router
  .post('/api/events/:slug/quiz/:quizId/session/submit', [
    IndexEventsController,
    'submitQuizSession',
  ])
  .use(middleware.auth())
router
  .get('/api/events/:slug/quiz/:quizId/session/time', [
    IndexEventsController,
    'getSessionTimeRemaining',
  ])
  .use(middleware.auth())

// Today routes
router
  .group(() => {
    // Basic Today CRUD operations
    router.get('/', [ManageTodayController, 'index'])
    router.get('/:slug', [ManageTodayController, 'show'])
    router.post('/', [ManageTodayController, 'store'])
    router.put('/:slug', [ManageTodayController, 'update'])
    router.delete('/:slug', [ManageTodayController, 'destroy'])

    // MCQ operations
    router.post('/:slug/questions/mcq', [ManageTodayController, 'addQuestion'])
    router.put('/:slug/questions/:questionSlug/mcq', [ManageTodayController, 'editQuestion'])
    router.delete('/:slug/questions/:questionId', [ManageTodayController, 'removeQuestion'])

    // Archive
    router.post('/archive-outdated', [ManageTodayController, 'archiveOutdated'])

    // Manage concept linkage
    router.post('/:slug/questions/:questionId/concepts', [
      ManageTodayController,
      'addConceptsToQuestion',
    ])
    router.delete('/:slug/questions/:questionId/concepts/:conceptId', [
      ManageTodayController,
      'removeConceptFromQuestion',
    ])
  })
  .prefix('/manage/today')
  .use(middleware.auth())

router.get('/today', [IndexTodayController, 'index']).as('today.index').use(middleware.auth())

//* SPOT: VIEW
router
  .group(() => {
    router.get('/', [IndexSpotController, 'index'])
    router.get('/:slug', [IndexSpotController, 'show'])
    router.get('/:conceptSlug/:paperSlug', [IndexSpotController, 'viewPaper'])
  })
  .prefix('/spot')
  .use(middleware.auth())

//* SPOT: MANAGE
router
  .group(() => {
    router.get('/', [ManageSpotController, 'index'])
    router.get('/:slug', [ManageSpotController, 'show'])
    router.get('/:conceptSlug/:paperSlug', [ManageSpotController, 'viewSpotPaper'])
    router.post('/', [ManageSpotController, 'store'])
    router.post('/:conceptSlug/:paperSlug/questions', [ManageSpotController, 'addQuestion'])
    router.put('/:conceptSlug/:paperSlug/questions/:questionSlug/spot', [
      ManageSpotController,
      'updateQuestion',
    ])
    router.delete('/:conceptSlug/:paperSlug/questions/:questionSlug', [
      ManageSpotController,
      'deleteQuestion',
    ])
    router.patch('/:paperSlug', [ManageSpotController, 'update'])
    router.delete('/:conceptSlug/:paperSlug', [ManageSpotController, 'destroy'])
  })
  .prefix('/manage/spot')
  .use(middleware.auth())

//* ONBOARDING
router
  .group(() => {
    router.get('/', [OnboardingController, 'show']).as('onboarding.show')
    router.post('/', [OnboardingController, 'store']).as('onboarding.store')
    router.get('/courses', [OnboardingController, 'getCourses']).as('onboarding.courses')
    router
      .get('/institutions', [OnboardingController, 'getInstitutions'])
      .as('onboarding.institutions')
  })
  .prefix('/onboarding')
  .use(middleware.auth())

// Add these routes with your other route definitions
router
  .get('/test/mpesa', [PaymentsController, 'showMpesaTestPage'])
  .as('payments.mpesa.test')
  .use(middleware.auth())

// API routes for payment processing
router
  .group(() => {
    router.post('/mpesa/process', [PaymentsController, 'processMpesaPayment'])
    router.post('/mpesa/verify', [PaymentsController, 'verifyMpesaPayment'])
    // Future Paystack routes
    // router.post('/paystack/process', [PaymentsController, 'processPaystackPayment'])
    // router.post('/paystack/verify', [PaymentsController, 'verifyPaystackPayment'])
  })
  .prefix('/api/payments')
  .use(middleware.auth())

router.get('/api/user/study-time', [UserProgressController, 'getStudyTime']).use(middleware.auth())
router
  .post('/api/study-sessions/:id/pause', [StudyTimeController, 'pauseSession'])
  .use(middleware.auth())
router
  .post('/api/study-sessions/:id/resume', [StudyTimeController, 'resumeSession'])
  .use(middleware.auth())
router
  .post('/api/study-sessions/:id/heartbeat', [StudyTimeController, 'heartbeat'])
  .use(middleware.auth())
router.post('/api/study-sessions', [StudyTimeController, 'create']).use(middleware.auth())

// Medical Articles CRUD

router.get('/medical-articles', [MedicalArticleController, 'index'])
router.get('/medical-articles/:id', [MedicalArticleController, 'show'])
router.post('/medical-articles', [MedicalArticleController, 'store'])
router.put('/medical-articles/:id', [MedicalArticleController, 'update'])
router.delete('/medical-articles/:id', [MedicalArticleController, 'destroy'])

// Medical Library routes

router.get('/library', [MedicalArticleController, 'library'])
router.get('/library/article/:article_id', [MedicalArticleController, 'showByArticleId'])
router.get('/library/:subject', [MedicalArticleController, 'showBySubject'])

// Media Assets
router.get('/media/:hintId', [MediaAssetsController, 'show'])

//* EVENTS -> VIEW
router
  .group(() => {
    router.get('/', [IndexEventsController, 'index']).as('events.index')
    router.get('/:slug', [IndexEventsController, 'show']).as('events.show')
    router.get('/:slug/quiz/:quizId', [IndexEventsController, 'quiz']).as('events.quiz')
  })
  .prefix('/events')
  .use(middleware.auth())

//* EVENTS -> MANAGE
router
  .group(() => {
    router.get('/', [ManageEventsController, 'index']).as('manage.events.index')
    router.get('/create', [ManageEventsController, 'create']).as('manage.events.create')
    router.post('/', [ManageEventsController, 'store']).as('manage.events.store')
    router.get('/:slug', [ManageEventsController, 'show']).as('manage.events.show')
    router.get('/:slug/edit', [ManageEventsController, 'edit']).as('manage.events.edit')
    router.put('/:slug', [ManageEventsController, 'update']).as('manage.events.update')
    router.delete('/:slug', [ManageEventsController, 'destroy']).as('manage.events.destroy')

    // Quiz management routes
    router
      .get('/:slug/quiz/create', [ManageEventsController, 'createQuiz'])
      .as('manage.events.quiz.create')
    router.post('/:slug/quiz', [EventQuizzesController, 'store']).as('manage.events.quiz.store')
    router
      .get('/:slug/quiz/:quizId', [ManageEventsController, 'viewQuiz'])
      .as('manage.events.quiz.view')
    router
      .get('/:slug/quiz/:quizId/edit', [ManageEventsController, 'editQuiz'])
      .as('manage.events.quiz.edit')
    router
      .put('/:slug/quiz/:quizId', [EventQuizzesController, 'update'])
      .as('manage.events.quiz.update')
    router
      .delete('/:slug/quiz/:quizId', [EventQuizzesController, 'destroy'])
      .as('manage.events.quiz.destroy')

    // Quiz question management routes
    router
      .post('/:slug/quiz/:quizId/questions', [ManageEventsController, 'addQuizQuestion'])
      .as('manage.events.quiz.questions.store')
    router
      .post('/:slug/quiz/:quizId/upload', [ManageEventsController, 'uploadQuizQuestions'])
      .as('manage.events.quiz.questions.upload')
    router
      .put('/:slug/quiz/:quizId/questions/:questionSlug', [
        ManageEventsController,
        'updateQuizQuestion',
      ])
      .as('manage.events.quiz.questions.update')
    router
      .delete('/:slug/quiz/:quizId/questions/:questionSlug', [
        ManageEventsController,
        'deleteQuizQuestion',
      ])
      .as('manage.events.quiz.questions.destroy')

    // Quiz leaderboard routes
    router
      .get('/:slug/quiz/:quizId/leaderboard', [ManageEventsController, 'showQuizLeaderboard'])
      .as('manage.events.quiz.leaderboard')

    // Quiz publish route
    router
      .put('/:slug/quiz/:quizId/publish', [EventQuizzesController, 'publish'])
      .as('manage.events.quiz.publish')

    // Event publish route
    router
      .put('/:slug/publish', [ManageEventsController, 'publishEvent'])
      .as('manage.events.publish')
  })
  .prefix('/manage/events')
  .use(middleware.auth())
