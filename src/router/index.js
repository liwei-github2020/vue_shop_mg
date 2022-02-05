import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
	{ path: '/', redirect: '/login' },
	{
		path: '/login',
		component: () => import('@/components/Login')
	},
	{
		path: '/home',
		component: () => import('@/components/Home'),
		children: [
			{
				path: '/',
				redirect: 'welcome'
			},
			{
				path: 'welcome',
				name: 'Welcome',
				component: () => import('@/components/Welcome')
			},
			{
				path: 'users',
				name: 'Users',
				component: () => import('@/components/user/Users')
			}
		]
	}
]

const router = new VueRouter({
	mode: 'history',
	base: process.env.BASE_URL,
	routes
})

// 导航守卫，如果没有登录，跳转到登录界面
router.beforeEach((to, from, next) => {
	if (to.path == '/login') return next();

	const token = window.sessionStorage.getItem("token");
	if (!token) return next('/login')

	next();
})

export default router