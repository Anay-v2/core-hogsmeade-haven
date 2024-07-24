<script setup lang="ts">
import { ref } from 'vue'
import firebaseConfig from '@/utils/firebase'
import { initializeApp } from 'firebase/app'
import {
	getAuth,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signInWithPopup,
	GoogleAuthProvider,
	sendEmailVerification,
	sendPasswordResetEmail,
} from 'firebase/auth'
import { getDatabase, ref as fref, set, get } from 'firebase/database'
import router from '@/router'
import Navbar from '@/components/Navbar.vue'
const email = ref('')
const password = ref('')
const app = initializeApp(firebaseConfig)
const database = getDatabase()
const auth = getAuth(app)
const show = ref(true)
auth.useDeviceLanguage()
function login() {
	signInWithEmailAndPassword(auth, email.value, password.value)
		.then(() => {
			router.push('/')
		})
		.catch(error => {
			window.alert(`Error ${error.code}: ${error.message}`)
		})
}
function signin() {
	createUserWithEmailAndPassword(auth, email.value, password.value)
		.then(() => {
			if (auth.currentUser)
				set(fref(database, `users/${auth.currentUser.uid}`), {
					created: new Date().getTime(),
					spent: 0,
				}).then(() => {
					show.value = false
					if (auth.currentUser) {
						sendEmailVerification(auth.currentUser).then(() => {})
					}
				})
		})
		.catch(error => {
			window.alert(`Error ${error.code}: ${error.message}`)
		})
}
function google() {
	const provider = new GoogleAuthProvider()
	signInWithPopup(auth, provider)
		.then(() => {
			if (auth.currentUser)
				get(fref(database, `users/${auth.currentUser.uid}`)).then(
					snap => {
						if (snap.exists()) router.push('/')
						else {
							if (auth.currentUser)
								set(
									fref(
										database,
										`users/${auth.currentUser.uid}`,
									),
									{
										created: new Date().getTime(),
										spent: '0.0.0',
									},
								).then(() => {
									router.push('/')
								})
						}
					},
				)
		})
		.catch(error => {
			window.alert(`Error ${error.code}: ${error.message}`)
		})
}
</script>
<template>
	<header><Navbar :signedin="false" picurl="" /></header>
	<main>
		<div
			class="min-h-full h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
		>
			<div class="max-w-md w-full space-y-8">
				<div class="card rounded-lg shadow-md dark:shadow-gray-800">
					<div class="card-body" v-if="show">
						<div class="card-title text-center block">
							<h1 class="text-4xl font-bold">Welcome</h1>
							<p class="text-gray-600">
								Sign in or create a new account
							</p>
						</div>
						<form autocomplete="on">
							<div class="form-control">
								<label for="email" class="label">
									<span class="label-text">Email</span>
								</label>
								<input
									type="email"
									id="email"
									class="input input-bordered"
									placeholder="youremail@example.com"
									v-model="email"
								/>
							</div>
							<div class="form-control">
								<label for="password" class="label">
									<span class="label-text">Password</span>
								</label>
								<input
									type="password"
									id="password"
									class="input input-bordered"
									placeholder="Password"
									autocomplete=""
									v-model="password"
								/>
								<label for="password" class="label justify-end">
									<a
										class="label-text text-primary cursor-pointer"
										@click.prevent="
											sendPasswordResetEmail(auth, email)
										"
										>Forgot password?</a
									>
								</label>
							</div>
						</form>
						<div class="items-center justify-between mt-4">
							<button
								class="btn btn-primary w-full"
								@click="login()"
							>
								Login
							</button>
							<br /><br />
							<button
								class="btn btn-secondary w-full"
								@click="signin()"
							>
								Sign up
							</button>
							<br /><br />
							<button
								class="btn btn-square hover:bg-white bg-white text-gray-800 w-full btn-icon"
								@click="google()"
							>
								<img
									src="https://developers.google.com/identity/images/g-logo.png"
									class="w-8 h-8"
								/>
								<span class="ml-2">Sign in with Google</span>
							</button>
						</div>
					</div>
				</div>
				<div class="card-body" v-if="!show">
					<div class="card-title text-center block">
						<h1 class="text-4xl font-bold">You're almost there!</h1>
						<p class="text-gray-600">
							An email has been sent to
							{{ auth?.currentUser?.email }}. Please verify your
							account by opening this email.
						</p>
					</div>
					<div class="items-center justify-between mt-4">
						<button
							class="btn btn-primary w-full"
							@click="router.push('/')"
						>
							Return to home
						</button>
					</div>
				</div>
			</div>
		</div>
	</main>
</template>
<style scoped></style>
