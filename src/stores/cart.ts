import { defineStore } from 'pinia'
import { ref } from 'vue'
import { data } from '@/utils/data'
import { fromKnuts, priceToText } from '@/utils/currency'

export const useCartStore = defineStore('cart', () => {
	const items = ref<Array<{ id: string; quantity: number }>>([])

	function addToCart(id: string) {
		const item = items.value.find(item => item.id === id)
		if (item) {
			item.quantity++
		} else {
			items.value.push({ id, quantity: 1 })
		}
	}

	function removeFromCart(productId: string) {
		const index = items.value.findIndex(item => item.id === productId)
		if (index !== -1) {
			items.value.splice(index, 1)
		}
	}

	function clearCart() {
		items.value = []
	}

	function totalPrice() {
		return priceToText(
			fromKnuts(
				items.value.reduce((total, item) => {
					const [galleons, sickles, knuts] = (
						data.find(v => v.id === item.id) || { price: '0.0.0' }
					).price
						.split('.')
						.map(Number)
					const totalKnuts = galleons * 493 + sickles * 29 + knuts
					return total + totalKnuts * item.quantity
				}, 0),
			),
		)
	}

	return {
		items,
		addToCart,
		removeFromCart,
		clearCart,
		totalPrice,
	}
})
