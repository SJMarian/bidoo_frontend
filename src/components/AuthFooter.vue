<template>
  <footer class="footer">
    <div class="trust-badges">
      <div class="badge">
        <Award color="#9ca3af" :size="24" />
        <span>AES-256 BIT<br />Encryption</span>
      </div>
      <div class="badge">
        <BadgeCheck color="#9ca3af" :size="24" />
        <span>KYC VERIFIED<br />Bidders Only</span>
      </div>
      <div class="badge">
        <ShieldCheck color="#9ca3af" :size="24" />
        <span>SECURE<br />Login</span>
      </div>
    </div>
    <p class="copyright">
      © 2024 Elite Auction Group, LLC. All rights reserved. Licensed and Bonded Auctioneer.
    </p>
  </footer>
</template>

<script setup lang="ts">
import { Award, BadgeCheck, ShieldCheck } from 'lucide-vue-next'
</script>

<style scoped>
.footer {
  padding: 3rem 1rem;
  text-align: center;
}

.trust-badges {
  display: flex;
  justify-content: center;
  gap: 4rem;
  margin-bottom: 2rem;
}

.badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-align: left;
  font-size: 0.75rem;
  color: #6b7280;
  line-height: 1.4;
  font-weight: 500;
}

.copyright {
  font-size: 0.8rem;
  color: #9ca3af;
}
</style>
