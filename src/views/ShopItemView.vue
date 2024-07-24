<script setup lang="ts">
import firebaseConfig from '@/utils/firebase'
import {
	getAuth,
	onAuthStateChanged,
	sendEmailVerification,
} from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import { getDatabase, get, ref as fref, set } from 'firebase/database'
import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import Navbar from '@/components/Navbar.vue'
import { useRoute, useRouter } from 'vue-router'
import { data } from '@/utils/data'
import {
	comparePrices,
	priceToText,
	multiplyPrice,
	calculateMoneyBalance,
	subtractPrices,
	addPrices,
} from '@/utils/currency'
import { useCartStore } from '@/stores/cart'
const route = useRoute()
const router = useRouter()
const firebaseApp = initializeApp(firebaseConfig)
const database = getDatabase()
const auth = getAuth()
const picURL: Ref<null | string> = ref(null)
const emailVerified: Ref<null | boolean> = ref(null)
const alertDismissed: Ref<boolean> = ref(false)
const signedIn: Ref<boolean> = ref(false)
const item = data.filter(v => v.id === route.params.id)[0]
const qty: Ref<number> = ref(1)
const price = computed(() => priceToText(multiplyPrice(item.price, qty.value)))
const wallet: Ref<string | number> = ref(0)
const affordable = computed(() =>
	wallet.value === 0
		? false
		: comparePrices(`${wallet.value}.0.0`, price.value) !== -1,
)
const confirmModal: Ref<any> = ref(null)
const confirmModal2: Ref<any> = ref(null)
const cart = useCartStore()
onAuthStateChanged(auth, user => {
	if (user) {
		// User is signed in, see docs for a list of available properties
		// https://firebase.google.com/docs/reference/js/auth.user
		signedIn.value = true
		picURL.value = user.photoURL
		emailVerified.value = user.emailVerified
		get(fref(database, `users/${user.uid}`)).then(snapshot => {
			console.log(snapshot.val())
			const spent = snapshot.val().spent || '0.0.0'
			const created = snapshot.val().created
			if (snapshot.exists())
				wallet.value = priceToText(
					subtractPrices(
						`${calculateMoneyBalance(created)}.0.0`,
						spent,
					),
				)
			else wallet.value = 0
			loadCart()
		})
	} else {
		// User is signed out
		// router.push('/login')
		signedIn.value = false
	}
})
function calculateDeliveryTime() {
	const p = price.value
	if (comparePrices(p, '10.0.0') !== 1) return 5_400_000 // 1.5 hours
	else if (comparePrices(p, '25.0.0') !== 1) return 43_200_000 // 0.5 days
	else if (comparePrices(p, '50.0.0') !== 1) return 172_800_000 // 2 days
	else return 604_800_000 // 1 week
}
function buy() {
	const deliveryTime = calculateDeliveryTime()
	if (auth.currentUser)
		get(fref(database, `users/${auth.currentUser.uid}/spent`)).then(
			snapshot => {
				const spent = snapshot.exists() ? snapshot.val() : '0.0.0'
				set(
					fref(database, `users/${auth.currentUser?.uid}/spent`),
					addPrices(multiplyPrice(item.price, qty.value), spent),
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

function calculateSelDeliveryTime(price: string) {
	const p = price
	if (comparePrices(p, '10.0.0') !== 1) return 5_400_000 // 1.5 hours
	else if (comparePrices(p, '25.0.0') !== 1) return 43_200_000 // 0.5 days
	else if (comparePrices(p, '50.0.0') !== 1) return 172_800_000 // 2 days
	else return 604_800_000 // 1 week
}

function selBuy(item: typeof cart.items[0]) {
	const price: string = data.find(v => v.id === item.id)?.price || '0.0.0'
	const deliveryTime = calculateSelDeliveryTime(price)
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
		selBuy(v)
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
	<Navbar :signedin="signedIn" :picurl="picURL" />
		<div class="indicator absolute top-4" :class="{'right-20': signedIn, 'right-36': !signedIn}">
		<span class="indicator-item badge badge-secondary" :class="{hidden: cart.items.length === 0}">{{ cart.items.length }}</span>

	<details
			class="dropdown dropdown-bottom dropdown-end"
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
					<button class="btn btn-success" @click="confirmModal2 && confirmModal2.showModal()" :disabled="!signedIn">Buy Cart (Price: {{ cart.totalPrice() }})</button>
					<button class="btn btn-error" @click="cart.clearCart();saveCart()">Empty Cart</button>
				</li>
				<li v-if="cart.items.length === 0">Your cart is empty.</li>
			</ul>
		</details>
	</div>
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
	<main>
		<!-- <div class="w-full join-vertical md:join-horizontal">
			<div
				class="w-full md:w-3/5 md:h-screen flex-grow grid place-items-center"
			>
				<img
					:src="item.img"
					:alt="`Image of ${item.name}`"
					class="w-full h-4/5 rounded-md"
				/>
			</div>
			<div
				class="w-full md:w-2/5 md:h-screen flex-grow sticky top-0"
			>
        </div>
		</div> -->
		<div class="card lg:card-side bg-base-100 shadow-xl w-full h-full">
			<figure>
				<img :src="item.img" :alt="`Image of ${item.name}`" />
			</figure>
			<div class="card-body">
				<h1 class="card-title text-4xl">{{ item.name }}</h1>
				<span class="flex gap-2">
					<span class="badge badge-primary">{{ item.seller }}</span
					><span class="badge badge-secondary">{{
						item.category
					}}</span>
				</span>
				<br />
				<p>{{ item.description }}</p>
				<strong>Quantity:</strong>
				<div class="join">
					<button
						class="btn dark:btn-neutral dark:bg-neutral-900 bg-slate-200 rounded-r-none"
						@click="qty++"
					>
						+
					</button>
					<span
						class="btn dark:btn-neutral rounded-none bg-base-100 hover:bg-base-100 no-animation"
					>
						{{ qty }}
					</span>
					<button
						class="btn dark:btn-neutral dark:bg-neutral-900 bg-slate-200 rounded-l-none"
						@click="qty > 1 && qty--"
					>
						-
					</button>
				</div>
				<span><strong>Price:</strong> {{ price }}</span>
				<span><strong>My Wallet:</strong> {{ wallet }}</span>
				<div class="card-actions">
					<button
						class="btn btn-primary"
						:disabled="!affordable || !emailVerified || !signedIn"
						@click="confirmModal && confirmModal.showModal()"
					>
						Buy
					</button>
					<button class="btn btn-secondary" @click="cart.addToCart(item.id);saveCart()">Add to Cart</button>
				</div>
			</div>
		</div>
		<!-- Open the modal using ID.showModal() method -->
		<dialog ref="confirmModal" class="modal">
			<div class="modal-box">
				<h3 class="text-lg font-bold">Are you sure?</h3>
				<p class="py-4">
					Are you sure you want to buy this item? This transaction
					cannot be undone! Make sure to check your
					<RouterLink to="/delivery" class="text-primary"
						>delivery settings</RouterLink
					>
					to ensure that the items will reach correctly.
				</p>
				<div class="modal-action">
					<button class="btn btn-primary" @click="buy()">
						Confirm
					</button>
					<form method="dialog">
						<!-- if there is a button in form, it will close the modal -->
						<button class="btn">Close</button>
					</form>
				</div>
			</div>
		</dialog>
		<!-- Open the modal using ID.showModal() method -->
		<dialog ref="confirmModal2" class="modal">
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
