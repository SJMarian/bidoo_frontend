<script setup lang="ts">
import { AuctionCountdown } from '@/components/countdown'
import HelloWorld from './components/HelloWorld.vue'
import TheWelcome from './components/TheWelcome.vue'
import { NotificationBell, NotificationToast } from '@/components/notification'

// Replace 1 with your actual logged-in user's ID when you add authentication
const currentUserId = 1
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="Bidoo" />
    </div>

    <!-- Notification bell sits in the header -->
    <NotificationBell :user-id="currentUserId" />
  </header>

  <main>
    <TheWelcome />
    <AuctionCountdown :auction-id="1" />
  </main>

  <!-- Toast floats above everything, place it once at the bottom of the template -->
  <NotificationToast :user-id="currentUserId" />
</template>

<style scoped>
header {
  line-height: 1.5;
  display: flex;
  align-items: center;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>