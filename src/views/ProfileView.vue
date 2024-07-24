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
import { getDatabase, get, ref as fref } from 'firebase/database'
import {
	priceToText,
	calculateMoneyBalance,
	subtractPrices,
} from '@/utils/currency'
const firebaseApp = initializeApp(firebaseConfig)
const database = getDatabase()
const auth = getAuth()
const picURL: Ref<null | string> = ref(null)
const emailVerified: Ref<null | boolean> = ref(null)
const alertDismissed: Ref<boolean> = ref(false)
const signedIn: Ref<boolean> = ref(false)
const usr: Ref<any> = ref(null)
onAuthStateChanged(auth, user => {
	if (user) {
		// User is signed in, see docs for a list of available properties
		// https://firebase.google.com/docs/reference/js/auth.user
		signedIn.value = true
		picURL.value = user.photoURL
		emailVerified.value = user.emailVerified
		usr.value = user
		getData()
	} else {
		// User is signed out
		// router.push('/login')
		signedIn.value = false
	}
})
function getData() {
	if (usr.value.uid)
		get(fref(database, `users/${usr.value.uid}`)).then(snapshot => {
			const snap = snapshot.exists() ? snapshot.val() : null
			if (snap) {
				usr.value.balance = priceToText(
					subtractPrices(
						`${calculateMoneyBalance(
							snap.created || Date.now(),
						)}.0.0`,
						snap.spent || '0.0.0',
					),
				)
			}
		})
}
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
		<img
			:src="
				picURL ||
				'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAABa0lEQVRYhe1XoY6DQBCdu5zCo8G2Gg0WdDXo/gICVcEvoEGji0aDpRqDwWPv8jY3CWlKbzahqbh9CSnZmfa9nZk3ST+mafqmN+LzneSAEWAEGAFful9YloWu16t68A5YlkVRFKkH7zrQWkQgvFwuNI4jHQ4HOh6P6nwYBrrdbuQ4DmVZpiVCS0BZltQ0DcVxrG67BipSVRWFYUhJkogFaM0AyHHze3IAZ4ghRwdiASgzEATBZg7HOFcCbRc866/uAAJiAa7rqs+u6zZzOMa5uwrA7dDjtm2VC+6BM8SQ8zIXzPNMaZoqO55OJ0UGwIJ1XSviPM/Jtu3XCKCV3R7hkT13FVAUhSozbup5nlo89Ft+9B+V8X2fzuezWIB4FTM5CLBo7vsMciwq5ABSESIB8DWTb/0wBHGMc3lVP4PIBTxgkhXL1cGsSCASgClHzyX24vno+34fAbxWeeAkWA/nXzD/C4wAI+CfCyCiH9k2sAgjYPP7AAAAAElFTkSuQmCC'
			"
			:alt="`Profile picture of ${usr.displayName}`"
		/>
		<h1 class="text-4xl">{{ usr?.displayName || '' }}</h1>
		<p class="text-neutral">{{ usr?.uid || '' }}</p>
		<br />
		<p class="text-bold">My Balance: {{ usr?.balance || 0 }}</p>
	</main>
</template>
