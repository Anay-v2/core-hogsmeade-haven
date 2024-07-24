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
		<h1 class="text-4xl">About us</h1>
		<p class="mt-4">
			<h2 class="text-3xl">Welcome to Hogsmeade Haven!</h2> In the heart of the wizarding world,
			Hogsmeade has always been a beloved destination for students and
			magical folks alike. With its charming shops and delightful
			offerings, it's a place where memories are made and adventures
			begin. However, in light of recent safety concerns and the increased
			presence of dark forces, weekend visits to Hogsmeade village have
			been temporarily suspended. But fret not! We have conjured a magical
			solution to ensure you can still enjoy the enchanting offerings of
			Hogsmeade from the comfort of your common rooms. <h2 class="text-3xl">Our Mission</h2>
			Hogsmeade Haven was created with a simple mission: to bring the
			magic of Hogsmeade to you, no matter where you are. We believe that
			the joy and wonder of exploring Hogsmeade should be accessible to
			all students, even in these uncertain times. Our online platform
			allows you to safely connect with local sellers and explore a
			delightful array of magical products. Whether you crave Honeydukes'
			finest confections, Zonko's playful pranks, or Madame Puddifoot's
			exquisite tea sets, Hogsmeade Haven has it all. <h2 class="text-3xl">What We Offer</h2><strong>Wide
			Range of Products:</strong> From sweets and beverages to magical accessories
			and potion ingredients, our platform offers a vast selection of
			items to cater to your magical needs. <br><strong>Convenient Shopping:</strong> Browse
			through our virtual shelves at any time, place your order, and await
			the graceful arrival of your goods delivered by trusty Hogwarts
			owls. <br><strong>Safe and Secure:</strong> Enjoy a seamless and secure shopping
			experience within the protective walls of Hogwarts. <br><strong>Customer
			Support:</strong> Our dedicated support team is here to help with any
			questions or issues you may have. <h2 class="text-3xl">Our Values</h2> <strong>Community:</strong> We strive to
			maintain the close-knit community feel of Hogsmeade, ensuring that
			you feel connected to the shops and sellers you love. <br><strong>Innovation:</strong>
			Embracing modern technology with magical flair, we continuously seek
			to improve and innovate our platform to provide you with the best
			experience. <br><strong>Integrity:</strong> Your trust is paramount to us. We are
			committed to ensuring the safety, security, and satisfaction of our
			users. <h2 class="text-3xl">Meet the Team</h2> Hogsmeade Haven was brought to life by a
			passionate team of wizards and witches dedicated to preserving the
			magic of Hogsmeade. Guided by Headmaster Albus Dumbledore's vision,
			we work tirelessly to deliver an enchanting shopping experience
			right to your doorstep. Thank you for choosing Hogsmeade Haven. We
			look forward to bringing a bit of Hogsmeade magic into your lives!
		</p>
	</main>
</template>
