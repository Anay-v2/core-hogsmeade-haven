<script setup lang="ts">
import { priceToText } from '@/utils/currency'
interface Data {
	name: string
	price: string
	seller: string
	category: string
	description: string
	img: string
	id: string
}
interface Props {
	data: Data
}
const props = defineProps<Props>()
const data = props.data
</script>
<template>
	<div class="card bg-base-100 shadow-xl w-full h-full">
		<figure>
			<img :src="data.img" alt="Shoes" />
		</figure>
		<div class="card-body">
			<h2 class="card-title">
				{{ data.name }}
			</h2>
			<h3 class="font-semibold text-lg">{{ priceToText(data.price) }}</h3>
			<p>{{ data.description }}</p>
			<p><strong>Seller</strong>: {{ data.seller }}</p>
			<div class="card-actions">
				<RouterLink :to="`/shop/${data.id}`" class="btn btn-primary"
					>Buy</RouterLink
				>
				<button class="btn btn-secondary" @click="$emit('addtocart')">
					Add to Cart
				</button>
			</div>
			<div class="badge badge-primary">{{ data.category }}</div>
		</div>
	</div>
</template>
<style scoped></style>
