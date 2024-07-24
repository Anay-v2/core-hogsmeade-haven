function comparePrices(p1: string, p2: string): number {
	const price1 = p1.split('.').map(v => parseInt(v))
	const price2 = p2.split('.').map(v => parseInt(v))
	if (price1[0] > price2[0]) return 1
	else if (price1[0] < price2[0]) return -1
	else {
		if (price1[1] > price2[1]) return 1
		else if (price1[1] < price2[1]) return -1
		else {
			if (price1[2] > price2[2]) return 1
			else if (price1[2] < price2[2]) return -1
			else {
				return 0
			}
		}
	}
	return 0
}
function toKnuts(galleons: number, sickles: number, knuts: number): number {
	return galleons * 493 + sickles * 29 + knuts
}
function fromKnuts(totalKnuts: number): string {
	const galleons = Math.floor(totalKnuts / 493)
	totalKnuts %= 493
	const sickles = Math.floor(totalKnuts / 29)
	const knuts = totalKnuts % 29
	return `${galleons}.${sickles}.${knuts}`
}

function subtractPrices(p1: string, p2: string): string {
	// Parse the input prices
	const [g1, s1, k1] = p1.split('.').map(Number)
	const [g2, s2, k2] = p2.split('.').map(Number)

	// Convert both prices to total knuts
	const totalKnuts1 = toKnuts(g1, s1, k1)
	const totalKnuts2 = toKnuts(g2, s2, k2)

	// Subtract the knuts
	const resultKnuts = totalKnuts1 - totalKnuts2

	// Convert back to galleons, sickles, and knuts
	return fromKnuts(resultKnuts)
}

function addPrices(p1: string, p2: string): string {
	// Parse the input prices
	const [g1, s1, k1] = p1.split('.').map(Number)
	const [g2, s2, k2] = p2.split('.').map(Number)

	// Convert both prices to total knuts
	const totalKnuts1 = toKnuts(g1, s1, k1)
	const totalKnuts2 = toKnuts(g2, s2, k2)

	// Subtract the knuts
	const resultKnuts = totalKnuts1 + totalKnuts2

	// Convert back to galleons, sickles, and knuts
	return fromKnuts(resultKnuts)
}

function multiplyPrice(p: string, n: number): string {
	// Split the price into galleons, sickles, and knuts
	let [galleons, sickles, knuts] = p.split('.').map(Number)

	// Convert the entire price to knuts
	let totalKnuts = toKnuts(galleons, sickles, knuts)

	// Multiply by the given number
	totalKnuts *= n

	// Return the formatted string
	return fromKnuts(totalKnuts)
}

function priceToText(price: string) {
	const split = price.split('.')
	return `${
		parseInt(split[0])
			? `${split[0]} Galleon${parseInt(split[0]) > 1 ? 's' : ''}`
			: ''
	}${
		parseInt(split[1])
			? `, ${split[1]} Sickle${parseInt(split[1]) > 1 ? 's' : ''}`
			: ''
	}${
		parseInt(split[2])
			? `, ${split[2]} Knut${parseInt(split[2]) > 1 ? 's' : ''}`
			: ''
	}`
}
function calculateMoneyBalance(c: number): number {
	const created = new Date(c)
	const now = new Date()
	const daysSinceCreated = Math.floor(
		(now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24),
	)
	return 80 + daysSinceCreated * 8
}

export {
	comparePrices,
	multiplyPrice,
	priceToText,
	calculateMoneyBalance,
	subtractPrices,
	addPrices,
	toKnuts,
	fromKnuts,
}
