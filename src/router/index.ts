import { createRouter, createWebHistory } from 'vue-router'
import AuctionModerationView from '../views/admin/AuctionModerationView.vue'
import AuctionBidView from '../views/auction/AuctionBidView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/admin/auctions',
      name: 'admin-auction-moderation',
      component: AuctionModerationView,
    },
    {
      path: '/auction/:id/bid',
      name: 'auction-bid',
      component: AuctionBidView,
    },
  ],
})

export default router