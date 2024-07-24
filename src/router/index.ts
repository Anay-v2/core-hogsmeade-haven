import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import ShopView from '@/views/ShopView.vue'
import ShopItemView from '@/views/ShopItemView.vue'
import DeliveryView from '@/views/DeliveryView.vue'
import FAQView from '@/views/FAQView.vue'
import AboutView from '@/views/AboutView.vue'
import ProfileView from '@/views/ProfileView.vue'

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{
			path: '/',
			name: 'home',
			component: HomeView,
		},
		{
			path: '/login',
			name: 'login',
			component: LoginView,
		},
		{
			path: '/shop',
			name: 'shop',
			component: ShopView,
		},
		{
			path: '/shop/:id',
			name: 'shop item',
			component: ShopItemView,
		},
		{
			path: '/delivery',
			name: 'delivery',
			component: DeliveryView,
		},
		{
			path: '/faq',
			name: 'faq',
			component: FAQView,
		},
		{
			path: '/about',
			name: 'about us',
			component: AboutView,
		},
		{
			path: '/profile',
			name: 'profile',
			component: ProfileView,
		},
	],
})

export default router
