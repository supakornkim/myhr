
const routes = [
  {
    path: '/',
    component: () => import('layouts/MyLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: 'takeleave', component: () => import('pages/TakeLeave.vue') }
    ]
  },
  {
    path: '/account',
    component: () => import('layouts/AccountLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Account.vue') }
    ]
  },
  { path: '/login', component: () => import('pages/Login.vue') }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
