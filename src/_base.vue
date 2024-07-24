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
</template>
