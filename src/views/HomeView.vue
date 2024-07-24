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
import { RouterLink } from 'vue-router'
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
	<header>
		<Navbar :signedin="signedIn" :picurl="picURL" />
		<div
			role="alert"
			class="alert"
			v-if="
				!(emailVerified === null) && !emailVerified && !alertDismissed
			"
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
	</header>
	<main>
		<div
			class="hero min-h-screen"
			style="
				background-image: url('data:image/jpeg;base64,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');
			"
		>
			<div class="hero-overlay bg-opacity-60"></div>
			<div class="hero-content text-neutral-content text-center">
				<div class="max-w-md">
					<h1 class="mb-5 text-5xl font-bold">
						Welcome to Hogsmeade Haven
					</h1>
					<p class="mb-5">
						Explore the magical wonders of Hogsmeade from your
						common room. Discover treats from Honeydukes, pranks
						from Zonko's, and more. Order now and let our trusty
						Hogwarts owls deliver straight to your dormitory. Stay
						safe and enjoy the magic!
					</p>
					<RouterLink
						role="button"
						:to="signedIn ? '/shop' : '/login'"
						class="btn btn-primary"
						>Get Started</RouterLink
					>
				</div>
			</div>
		</div>
		<div class="bg-base-200 text-left max-w-md min-w-full p-5">
      <h1 class="text-5xl font-bold">Why us?</h1>
      <p class="py-6">
        Here's a few reasons you can trust us when it comes to shopping:
		<ul>
			<li><strong>Officialy endorsed:</strong> this platform is officially endorsed by Dumbledore as the preffered platform for online hogsmeade shopping.</li>
			<li><strong>Safe transactions:</strong> we ensure that all transactions are safe and secure.</li>
			<li><strong>Large varierty:</strong> we offer a large variety of items ranging from small pranks to broomsticks.</li>
			<li><strong>Fast delivery:</strong> our delivery team ensure that you won't have to wait too much to recieve your order.</li>
		</ul>
      </p>
    </div>
			<div class="bg-base-200 text-left max-w-md min-w-full p-5">
				<h1 class="text-5xl font-bold">Our Customers</h1>
				<div class="md:flex md:gap-2 py-6">
					<div class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <h2 class="card-title">Harry Potter</h2>
	<h3 class="text-xl">⭐⭐⭐⭐⭐</h3>
    <p>"As a Gryffindor student, I often find myself busy with classes, Quidditch practice, and the occasional adventure. The Hogsmeade Haven app has been a lifesaver! Now I can easily order my favorite sweets from Honeydukes and get new prank items from Zonko's without leaving the common room. It's incredibly convenient and the delivery by Hogwarts owls is always on time. Highly recommended!"</p>
  </div>
</div>
<div class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <h2 class="card-title">Hermione Granger</h2>
	<h3 class="text-xl">⭐⭐⭐⭐⭐</h3>
    <p>"Hogsmeade Haven is an excellent solution for students who want to focus on their studies without missing out on the best of Hogsmeade. Whether it's getting a new quill from Scrivenshaft's Quill Shop or a much-needed potion ingredient from the Apothecary, this app has it all. The interface is user-friendly, and the service is impeccable. Five stars from me!"</p>
  </div>
</div>
<div class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <h2 class="card-title">Luna Lovegood</h2>
	<h3 class="text-xl">⭐⭐⭐⭐⭐</h3>
    <p>"I adore the Hogsmeade Haven app! It's such a magical way to stay connected with the charm of Hogsmeade while staying safe at Hogwarts. I love ordering my favorite Butterbeer from The Three Broomsticks and discovering unique items like Pygmy Puffs from Weasleys' Wizard Wheezes. The app brings a bit of whimsy to my day and I can't imagine life without it now."</p>
  </div>
</div>
				</div>
</div>
	</main>
</template>
