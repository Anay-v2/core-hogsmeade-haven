<script setup lang="ts">
import firebaseConfig from '@/utils/firebase'
import {
	getAuth,
	onAuthStateChanged,
	sendEmailVerification,
} from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import { getDatabase, ref as fref, set, get } from 'firebase/database'
import { ref } from 'vue'
import type { Ref } from 'vue'
import Navbar from '@/components/Navbar.vue'
import router from '@/router'
import { data } from '@/utils/data'
const firebaseApp = initializeApp(firebaseConfig)
const database = getDatabase()
const auth = getAuth()
const picURL: Ref<null | string> = ref(null)
const emailVerified: Ref<null | boolean> = ref(null)
const alertDismissed: Ref<boolean> = ref(false)
const signedIn: Ref<boolean> = ref(false)
const house: Ref<string> = ref('')
const option: Ref<string> = ref('')
const deliveries: Ref<[string, string, boolean][]> = ref([])
onAuthStateChanged(auth, user => {
	if (user) {
		// User is signed in, see docs for a list of available properties
		// https://firebase.google.com/docs/reference/js/auth.user
		signedIn.value = true
		picURL.value = user.photoURL
		emailVerified.value = user.emailVerified
		getData()
	} else {
		// User is signed out
		// router.push('/login')
		signedIn.value = false
	}
})
function getData() {
	if (auth.currentUser)
		get(fref(database, `users/${auth.currentUser.uid}/delivery`)).then(
			snapshot => {
				if (snapshot.exists()) {
					house.value = snapshot.val().house || ''
					option.value = snapshot.val().option || ''
					deliveries.value = parseDeliveries(
						JSON.parse(snapshot.val().current || '[]'),
					)
				}
			},
		)
}
function save() {
	if (auth.currentUser)
		set(fref(database, `users/${auth.currentUser.uid}/delivery`), {
			house: house.value,
			option: option.value,
		}).then(() => {
			alert('Delivery details saved!')
			router.push('/')
		})
}

function parseDeliveries(d): [string, string, boolean][] {
	const r = []
	const dk = Object.keys(d)
	for (let i = 0; i < dk.length; i++) {
		const dkey = dk[i]
		const dval = d[dkey]
		const name = data.find(v => v.id === dkey)?.name
		for (let k = 0; k < dval.length; k++) {
			r.push([name, parseDate(dval[k]), new Date().getTime() >= dval[k]])
		}
	}
	return r
}
function parseDate(d: number): string {
	const msInDay = 24 * 60 * 60 * 1000
	const msInHour = 60 * 60 * 1000
	const msSinceEpoch = Date.now()
	const delta = d > msSinceEpoch ? d - msSinceEpoch : msSinceEpoch - d
	console.log(delta)
	let days = Math.floor(delta / msInDay)
	let hours = Math.floor((delta % msInDay) / msInHour)
	if (days === 0 && hours === 0) hours++
	let result = ''
	if (days > 0) {
		result += `${days} day${days > 1 ? 's' : ''}`
	}
	if (hours > 0) {
		result += ` ${hours} hour${hours > 1 ? 's' : ''}`
	}
	result.trim()
	console.log(d, Date.now(), result)
	return `${d > msSinceEpoch ? 'In ' : ''}${result}${
		d < msSinceEpoch ? ' Ago' : ''
	}`
}
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
	<main class="mt-3 ml-3 flex gap-2 flex-col lg:flex-row">
		<div>
			<h1 class="text-3xl">Delivery Settings</h1>
			<form @submit.prevent="save()">
				<label class="form-control w-full max-w-xs">
					<div class="label">
						<span class="label-text">Pick your house</span>
					</div>
					<select
						class="select select-bordered"
						required
						v-model="house"
					>
						<option disabled selected>Pick one</option>
						<option value="g">Gryffindor</option>
						<option value="h">Hufflepuff</option>
						<option value="s">Slytherin</option>
						<option value="r">Ravenclaw</option>
					</select>
				</label>
				<label class="form-control w-full max-w-xs">
					<div class="label">
						<span class="label-text"
							>Pick your delivery option</span
						>
					</div>
					<select
						class="select select-bordered"
						required
						v-model="option"
					>
						<option disabled selected>Pick one</option>
						<option value="o">Owlery</option>
						<option value="d">Dormitory</option>
					</select>
				</label>
				<button
					action="submit"
					class="btn btn-primary mt-3"
					:disabled="!signedIn || !emailVerified"
				>
					Save
				</button>
			</form>
		</div>
		<div class="divider lg:divider-horizontal"></div>
		<div>
			<h1 class="text-3xl">Current Deliveries</h1>
			<template v-for="delivery in deliveries" :key="delivery[1]">
				<p>
					<s v-if="delivery[2]"
						><strong>{{ delivery[0] }}</strong
						>: {{ delivery[1] }}</s
					>
					<template v-else>
						<strong>{{ delivery[0] }}</strong
						>: {{ delivery[1] }}
					</template>
				</p>
			</template>
		</div>
	</main>
</template>
