<script setup lang="ts">
import firebaseConfig from '@/utils/firebase'
import {
	getAuth,
	onAuthStateChanged,
	sendEmailVerification,
} from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import { ref } from 'vue'
import type { Ref } from 'vue'
import Navbar from '@/components/Navbar.vue'
const firebaseApp = initializeApp(firebaseConfig)
const auth = getAuth()
const picURL: Ref<null | string> = ref(null)
const emailVerified: Ref<null | boolean> = ref(null)
const alertDismissed: Ref<boolean> = ref(false)
const signedIn: Ref<boolean> = ref(false)
onAuthStateChanged(auth, user => {
	if (user) {
		// User is signed in, see docs for a list of available properties
		// https://firebase.google.com/docs/reference/js/auth.user
		signedIn.value = true
		picURL.value = user.photoURL
		emailVerified.value = user.emailVerified
	} else {
		// User is signed out
		// router.push('/login')
		signedIn.value = false
	}
})
</script>

<template>
	<Navbar :signedin="signedIn" :picurl="picURL" />
	<div
		role="alert"
		class="alert"
		v-if="!(emailVerified === null) && !emailVerified && !alertDismissed"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			class="stroke-info h-6 w-6 shrink-0"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
			></path>
		</svg>
		<span
			>Your email is not verified! Check your email for a verification
			message.</span
		>
		<div>
			<button class="btn btn-sm" @click="alertDismissed = true">
				Dismiss
			</button>
			<button
				class="btn btn-sm btn-primary"
				@click="
					auth.currentUser &&
						sendEmailVerification(auth.currentUser).then(
							() => (alertDismissed = true),
						)
				"
			>
				Resend
			</button>
		</div>
	</div>
	<main class="py-4">
		<h1 class="text-4xl">FAQs</h1>
		<ul>
			<li
				tabindex="0"
				class="collapse collapse-arrow border-base-300 bg-base-200 border mt-4"
			>
				<div class="collapse-title text-xl font-medium">
					1. How do I create an account on Hogsmeade Haven?
				</div>
				<div class="collapse-content">
					<p>
						To create an account, simply click on the "Sign Up"
						button on the login page, fill in your details, and
						follow the on-screen instructions. Once you've verified
						your email, you'll be ready to start shopping!
					</p>
				</div>
			</li>
			<li
				tabindex="0"
				class="collapse collapse-arrow border-base-300 bg-base-200 border"
			>
				<div class="collapse-title text-xl font-medium">
					2. What kinds of products can I buy on Hogsmeade Haven?
				</div>
				<div class="collapse-content">
					<p>
						Hogsmeade Haven offers a wide variety of magical
						products, including sweets from Honeydukes, prank items
						from Zonko's, accessories from The Magic Shop, potions
						from Madame Puddifoot's, and much more. We also have
						items for pets, ingredients, books, and sports gear like
						Quidditch sets.
					</p>
				</div>
			</li>
			<li
				tabindex="0"
				class="collapse collapse-arrow border-base-300 bg-base-200 border"
			>
				<div class="collapse-title text-xl font-medium">
					3. How are the items delivered?
				</div>
				<div class="collapse-content">
					<p>
						All items are delivered by Hogwarts' trusty owls. You
						can choose to have your items delivered to the Owlery or
						directly to your dormitory.
					</p>
				</div>
			</li>
			<li
				tabindex="0"
				class="collapse collapse-arrow border-base-300 bg-base-200 border"
			>
				<div class="collapse-title text-xl font-medium">
					4. Can I track my order?
				</div>
				<div class="collapse-content">
					<p>
						Yes, you can track your order through the deliveries
						page. You will receive updates about your order status
						and delivery times.
					</p>
				</div>
			</li>
			<div
				tabindex="0"
				class="collapse collapse-arrow border-base-300 bg-base-200 border"
			>
				<div class="collapse-title text-xl font-medium">
					5. How do I pay for my items?
				</div>
				<div class="collapse-content">
					<p>
						Each user is allotted 80 Galleons upon signing up. You
						will also receive a daily allowance of 8 Galleons. The
						balance can be checked in your profile, and all
						purchases will be deducted from your balance.
					</p>
				</div>
			</div>
			<div
				tabindex="0"
				class="collapse collapse-arrow border-base-300 bg-base-200 border"
			>
				<div class="collapse-title text-xl font-medium">
					6. Is my personal information safe?
				</div>
				<div class="collapse-content">
					<p>
						Absolutely! We take your privacy and security very
						seriously. All personal information is encrypted and
						stored securely. We do not share your information with
						third parties.
					</p>
				</div>
			</div>
		</ul>
	</main>
</template>
