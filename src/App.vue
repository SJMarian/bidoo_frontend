<template>
<div class='page'>
<header class='topbar'><div class='brand'>Bidoo</div><input v-model='search' class='search' placeholder='Search luxury assets...'/><div class='tabs'><button v-for='tab in tabs' :key='tab' @click='activeTab=tab' :class="['tab',activeTab===tab?'active':'']">{{tab}}</button><button class='tab active'>My Bid</button></div></header>

<div v-if='view==="list"' class='section'>
<h2>{{activeTab}} Auctions</h2>
<div class='grid'>
<div v-for='item in filtered' :key='item.id' class='card'>
<img :src='item.image' class='thumb'/>
<h3>{{item.title}}</h3>
<p>{{item.description}}</p>
<div class='price'>{{currency}}{{displayPrice(item)}}</div>
<div class='status'>{{labelStatus(item.status)}}</div>

<button v-if="labelStatus(item.status)==='Live'" class='bid' @click='openItem(item)'>Bid Now</button>
<button v-else class='tab' disabled>{{labelStatus(item.status)}}</button>
</div>
</div>
</div>

<div v-else class='section detail'>
<button class='tab' @click='view="list"'>← Back</button>

<div class='detail-grid'>
<img :src='selected.image' class='hero'/>

<div>
<h1>{{selected.title}}</h1>
<p>{{selected.description}}</p>

<div class='price'>{{currency}}{{displayPrice(selected)}}</div>
<div class='status'>{{labelStatus(selected.status)}}</div>

<select v-model='currency' class='field'>
<option value='৳'>৳</option>
<option value='$'>$</option>
<option value='€'>€</option>
</select>

<input
v-if="labelStatus(selected.status)==='Live'"
v-model='bidAmount'
class='field'
placeholder='Enter bid amount'
/>

<button
v-if="labelStatus(selected.status)==='Live'"
class='bid'
@click='placeBid'
>
Place Bid
</button>

<button v-else class='tab' disabled>
{{labelStatus(selected.status)}}
</button>

<ul class='history'>
<li v-for='(b,i) in bids' :key='i'>{{b}}</li>
</ul>
</div>
</div>
</div>
</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const tabs = ['Live', 'Upcoming', 'Closed', 'Paid']

const activeTab = ref('Live')
const search = ref('')
const view = ref('list')
const currency = ref('৳')
const bidAmount = ref('')

const rates = ref({
BDT: 1,
USD: 0.008143,
EUR: 0.006916
})

const items = ref([])
const selected = ref({})
const bids = ref([])

const getImage = (title = '') => {
title = title.toLowerCase()

if (title.includes('laptop'))
return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=900'

if (title.includes('phone'))
return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900'

if (title.includes('watch'))
return 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=900'

if (title.includes('camera'))
return 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=900'

if (title.includes('car'))
return 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=900'

return 'https://via.placeholder.com/600x400?text=Auction'
}

const normalize = (a) => ({
...a,
image: getImage(a.title)
})

const fetchAuctions = async () => {
const { data } = await axios.get(
'http://localhost:8080/api/v1/auction/search'
)

const oldId =
selected.value.id ||
selected.value.auctionId ||
selected.value.auctionItemId

items.value = (Array.isArray(data) ? data : []).map(normalize)

if (oldId) {
selected.value =
items.value.find(
(i) =>
(i.id || i.auctionId || i.auctionItemId) == oldId
) || items.value[0] || {}
} else {
selected.value = items.value[0] || {}
}
}

onMounted(async () => {
await fetchAuctions()

try {
const { data } = await axios.get(
'http://localhost:8080/api/v1/currency/convert?amount=1'
)

rates.value = {
BDT: data.bdt || 1,
USD: data.usd || 0.008143,
EUR: data.eur || 0.006916
}
} catch (e) {}
})

const labelStatus = (s) =>
({
ACTIVE: 'Live',
LIVE: 'Live',
UPCOMING: 'Upcoming',
PENDING: 'Upcoming',
CLOSED: 'Closed',
ENDED: 'Closed',
PAID: 'Paid'
}[s] || s)

const basePrice = (i) =>
(i.currentHighestBid && i.currentHighestBid > 0
? i.currentHighestBid
: i.bidStartingPrice || i.price || 0)

const displayPrice = (i) => {
const p = basePrice(i)

if (currency.value === '$')
return Math.round(p * rates.value.USD * 100) / 100

if (currency.value === '€')
return Math.round(p * rates.value.EUR * 100) / 100

return Math.round(p)
}

const filtered = computed(() =>
items.value
.filter((i) =>
i.title?.toLowerCase().includes(search.value.toLowerCase())
)
.filter((i) => labelStatus(i.status) === activeTab.value)
)

const openItem = (i) => {
selected.value = i
view.value = 'detail'
}

const placeBid = async () => {
if (!bidAmount.value) return

try {
const uiId =
selected.value.id ||
selected.value.auctionId ||
selected.value.auctionItemId

let realId = Number(uiId)
const enteredAmount = Number(bidAmount.value)

if (realId === 1) {
alert('Laptop auction is closed')
return
}

if (realId >= 2) {
realId = realId + 1
}

await axios.post(
'http://localhost:8080/api/v1/bids',
{
auctionId: realId,
amount: enteredAmount
}
)

/* success message */
bids.value.unshift(
'✅ Bid placed successfully: ' +
currency.value +
enteredAmount.toLocaleString()
)

/* keep updated price on detail page */
selected.value.currentHighestBid = enteredAmount
selected.value.bidStartingPrice = enteredAmount
selected.value.price = enteredAmount
selected.value = { ...selected.value }

/* keep updated price in cards */
const index = items.value.findIndex(
(x) =>
(x.id || x.auctionId || x.auctionItemId) == uiId
)

if (index !== -1) {
items.value[index].currentHighestBid = enteredAmount
items.value[index].bidStartingPrice = enteredAmount
items.value[index].price = enteredAmount
}

/* no fetchAuctions here */

alert('Bid placed successfully!')

} catch (e) {
alert(
e?.response?.data?.message ||
JSON.stringify(e?.response?.data) ||
e.message ||
'Bid failed'
)
}

bidAmount.value = ''
}
</script>

<style>
*{box-sizing:border-box}
body{margin:0;font-family:Arial,sans-serif;background:#ececec;color:#111}
.topbar{display:flex;gap:16px;flex-wrap:wrap;align-items:center;padding:16px 22px;background:#fff}
.brand{font-size:48px;font-weight:700}
.search{flex:1;max-width:420px;padding:14px;border:1px solid #ddd;border-radius:14px}
.tabs{display:flex;gap:10px;flex-wrap:wrap}
.tab,.bid{border:none;padding:12px 18px;border-radius:14px;background:#e5e7eb;cursor:pointer}
.active,.bid{background:#2f66e0;color:#fff}
.section{padding:26px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:22px}
.card{background:#fff;padding:14px;border-radius:20px;box-shadow:0 8px 18px rgba(0,0,0,.08)}
.thumb{width:100%;height:220px;object-fit:cover;border-radius:16px}
.price{font-size:28px;font-weight:700;color:#2f66e0;margin:10px 0}
.status{font-weight:700;margin-bottom:12px}
.bid{width:100%}
.tabs .bid,.tabs .tab{width:auto}
.detail-grid{display:grid;grid-template-columns:1.2fr 1fr;gap:24px}
.hero{width:100%;height:460px;object-fit:cover;border-radius:20px}
.field{width:100%;padding:12px;margin:10px 0;border:1px solid #ddd;border-radius:12px}
.history{background:#fff;padding:14px;border-radius:14px;list-style:none}
.history li{padding:8px 0;border-bottom:1px solid #eee}
@media(max-width:900px){
.detail-grid{grid-template-columns:1fr}
.brand{font-size:38px}
}
</style>
