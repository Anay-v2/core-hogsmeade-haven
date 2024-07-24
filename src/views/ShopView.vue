<script setup lang="ts">
import firebaseConfig from '@/utils/firebase'
import {
	getAuth,
	onAuthStateChanged,
	sendEmailVerification,
} from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import { getDatabase, ref as fref, get, set } from 'firebase/database'
import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import Item from '@/components/Item.vue'
import { data } from '@/utils/data'
import { addPrices, comparePrices, multiplyPrice } from '@/utils/currency'
import { useCartStore } from '@/stores/cart'
const router = useRouter()
const firebaseApp = initializeApp(firebaseConfig)
const database = getDatabase()
const auth = getAuth()
const picURL: Ref<null | string> = ref(null)
const emailVerified: Ref<null | boolean> = ref(null)
const alertDismissed: Ref<boolean> = ref(false)
const signedIn: Ref<boolean> = ref(false)
const sortBy: Ref<string> = ref('')
const search: Ref<string> = ref('')
const seller: Ref<string> = ref('')
const category: Ref<string> = ref('')
const categories: string[] = compile(data, 'category')
const sellers: string[] = compile(data, 'seller')
const cart = useCartStore()
const confirmModal: Ref<any> = ref(null)
const filteredData = computed(() => {
	const sort = sortBy.value
	const s = search.value.toLowerCase().trim()
	const c = category.value
	const se = seller.value
	let fd = data
	if (sort[0] === 'a') {
		fd.sort((a, b) =>
			(sort[1] === 'a' ? a : b).name.localeCompare(
				(sort[1] === 'a' ? b : a).name,
			),
		)
	}
	if (sort[0] === 'p') {
		fd.sort((a, b) =>
			comparePrices(
				(sort[1] === 'a' ? a : b).price,
				(sort[1] === 'a' ? b : a).price,
			),
		)
	}
	if (sort === 'r') {
		fd.sort(() => Math.random() - 0.5)
	}
	if (s !== '') fd = fd.filter(v => v.name.toLowerCase().includes(s))
	if (c.length > 0 && !c.includes('All'))
		fd = fd.filter(v => c.includes(v.category))
	if (se.length > 0 && !se.includes('All'))
		fd = fd.filter(v => se.includes(v.seller))
	return fd
})
onAuthStateChanged(auth, user => {
	if (user) {
		// User is signed in, see docs for a list of available properties
		// https://firebase.google.com/docs/reference/js/auth.user
		signedIn.value = true
		picURL.value = user.photoURL
		emailVerified.value = user.emailVerified
		loadCart()
	} else {
		// User is signed out
		// router.push('/login')
		signedIn.value = false
	}
})
function compile(data: any[], prop: string): string[] {
	const arr: string[] = []
	data.forEach(v => {
		if (!arr.includes(v[prop])) arr.push(v[prop])
	})
	return arr.sort((a, b) => a.localeCompare(b))
}

function calculateDeliveryTime(price: string) {
	const p = price
	if (comparePrices(p, '10.0.0') !== 1) return 5_400_000 // 1.5 hours
	else if (comparePrices(p, '25.0.0') !== 1) return 43_200_000 // 0.5 days
	else if (comparePrices(p, '50.0.0') !== 1) return 172_800_000 // 2 days
	else return 604_800_000 // 1 week
}
function buy(item: typeof cart.items[0]) {
	const price: string = data.find(v => v.id === item.id)?.price || '0.0.0'
	const deliveryTime = calculateDeliveryTime(price)
	if (auth.currentUser)
		get(fref(database, `users/${auth.currentUser.uid}/spent`)).then(
			snapshot => {
				const spent = snapshot.exists() ? snapshot.val() : '0.0.0'
				set(
					fref(database, `users/${auth.currentUser?.uid}/spent`),
					addPrices(multiplyPrice(price, item.quantity), spent),
				).then(() => {
					get(
						fref(
							database,
							`users/${auth.currentUser?.uid}/delivery/current`,
						),
					).then(snapshot => {
						const current = snapshot.val()
							? JSON.parse(snapshot.val())
							: {}
						if (current[item.id])
							current[item.id].push(
								new Date().getTime() + deliveryTime,
							)
						else
							current[item.id] = [
								new Date().getTime() + deliveryTime,
							]
						set(
							fref(
								database,
								`users/${auth.currentUser?.uid}/delivery/current`,
							),
							JSON.stringify(current),
						).then(() => {
							alert('Item bought successfully!')
							router.push('/shop')
						})
					})
				})
			},
		)
}

function buyAll() {
	cart.items.forEach(v => {
		buy(v)
	})
	cart.clearCart()
	saveCart()
}

function saveCart() {
	if(auth.currentUser) {
		set(fref(database, `users/${auth.currentUser.uid}/cart`), JSON.stringify(cart.items))
	}
}

function loadCart() {
	if(auth.currentUser) {
		get(fref(database, `users/${auth.currentUser.uid}/cart`)).then(snapshot => {
			cart.$patch({items: snapshot.exists() ? JSON.parse(snapshot.val()) : []})
		})
	}
}
</script>

<template>
	<header>
		<Navbar :signedin="signedIn" :picurl="picURL" />
		<details
			class="dropdown dropdown-bottom dropdown-end absolute top-4"
			:class="{'right-20': signedIn, 'right-36': !signedIn}"
		>
			<summary class="btn btn-sm">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
					class="size-6"
				>
					<path
						d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 0 0-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 0 0 0-1.5H5.378A2.25 2.25 0 0 1 7.5 15h11.218a.75.75 0 0 0 .674-.421 60.358 60.358 0 0 0 2.96-7.228.75.75 0 0 0-.525-.965A60.864 60.864 0 0 0 5.68 4.509l-.232-.867A1.875 1.875 0 0 0 3.636 2.25H2.25ZM3.75 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM16.5 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z"
					/>
				</svg>
			</summary>
			<ul
				class="menu dropdown-content bg-base-100 rounded-box z-[9999] w-52 p-2 shadow"
			>
				<li v-for="item in cart.items">
					<div class="bg-base-100 shadow-xl join p-0">
							<img
								:src="data.find(v => v.id === item.id)?.img"
								:alt="`Picture of ${
									data.find(v => v.id === item.id)?.name
								}`"
								class="h-full rounded-l-md"
							/>
						<div>
							<h2 class="text-xl">
								{{ data.find(v => v.id === item.id)?.name }}
								<button class="btn btn-error btn-sm" @click="cart.removeFromCart(item.id);saveCart()">&times;</button>
							</h2>
							<p><div class="join">
					<button
						class="btn btn-sm dark:btn-neutral dark:bg-neutral-900 bg-slate-200 rounded-r-none"
						@click="item.quantity++;saveCart()"
					>
						+
					</button>
					<span
						class="btn btn-sm dark:btn-neutral rounded-none bg-base-100 hover:bg-base-100 no-animation"
					>
						{{ item.quantity }}
					</span>
					<button
						class="btn btn-sm dark:btn-neutral dark:bg-neutral-900 bg-slate-200 rounded-l-none"
						@click="item.quantity > 1 && item.quantity--;saveCart()"
					>
						-
					</button>
				</div></p>
							
						</div>
					</div>
				</li>
				<li class="flex gap-2 mt-2" v-if="cart.items.length > 0">
					<button class="btn btn-success" @click="confirmModal && confirmModal.showModal()" :disabled="!signedIn">Buy Cart (Price: {{ cart.totalPrice() }})</button>
					<button class="btn btn-error" @click="cart.clearCart();saveCart()">Empty Cart</button>
				</li>
				<li v-if="cart.items.length === 0">Your cart is empty.</li>
			</ul>
		</details>
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
		<div class="flex w-full flex-col lg:flex-row">
			<div
				class="w-full lg:w-1/5 lg:h-screen flex-grow lg:sticky lg:top-0"
			>
				<div class="join join-vertical">
					<label class="input input-bordered flex items-center gap-2">
						<input
							type="text"
							class="grow"
							placeholder="Search"
							v-model="search"
						/>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 16 16"
							fill="currentColor"
							class="h-4 w-4 opacity-70"
						>
							<path
								fill-rule="evenodd"
								d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
								clip-rule="evenodd"
							/>
						</svg>
					</label>
					<select class="select w-full max-w-xs" v-model="sortBy">
						<option disabled selected value="">Sort By:</option>
						<
						<option value="aa">Alphabetical (ascending)</option>
						<option value="ad">Alphabetical (descending)</option>
						<option value="pa">Price (ascending)</option>
						<option value="pd">Price (descending)</option>
						<option value="r">Random</option>
						>
					</select>
					<label class="font-bold text-lg pl-5">Category:</label>
					<select
						class="select w-full max-w-xs"
						v-model="category"
						multiple
					>
						<option>All</option>
						<option v-for="category in categories">
							{{ category }}
						</option>
					</select>
					<label class="font-bold text-lg pl-5">Seller:</label>
					<select
						class="select w-full max-w-xs"
						v-model="seller"
						multiple
					>
						<option>All</option>
						<option v-for="seller in sellers">
							{{ seller }}
						</option>
					</select>
				</div>
			</div>
			<div
				class="w-full lg:w-4/5 flex-grow grid place-items-center grid-cols-1 grid-rows-auto md:grid-cols-2 md:grid-rows-auto lg:grid-cols-4 lg:grid-rows-auto gap-4"
			>
				<template v-for="item in filteredData" :key="item.id">
					<Item :data="item" @addtocart="cart.addToCart(item.id);saveCart()" />
				</template>
			</div>
		</div>
		<!-- Open the modal using ID.showModal() method -->
		<dialog ref="confirmModal" class="modal">
			<div class="modal-box">
				<h3 class="text-lg font-bold">Are you sure?</h3>
				<p class="py-4">
					Are you sure you want to buy these items? This transaction
					cannot be undone! Make sure to check your
					<RouterLink to="/delivery" class="text-primary"
						>delivery settings</RouterLink
					>
					to ensure that the items will reach correctly.
				</p>
				<div class="modal-action">
					<button class="btn btn-primary" @click="buyAll()">
						Confirm
					</button>
					<form method="dialog">
						<!-- if there is a button in form, it will close the modal -->
						<button class="btn">Close</button>
					</form>
				</div>
			</div>
		</dialog>
	</main>
</template>
