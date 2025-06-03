<script setup lang="ts">
import { ref } from 'vue'
import LoginCard from '@/components/auth/LoginCard.vue'
import RegisterCard from '@/components/auth/RegisterCard.vue'
import { Sparkles, Star, Trophy, Heart } from 'lucide-vue-next';

const selectedTab = ref('login')
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute top-10 left-10 text-yellow-300 animate-bounce">
        <Star :size="24" />
      </div>
      <div class="absolute top-20 right-20 text-yellow-300 animate-pulse">
        <Sparkles :size="32" />
      </div>
      <div class="absolute bottom-20 left-20 text-yellow-300 animate-bounce delay-100">
        <Trophy :size="28" />
      </div>
      <div class="absolute bottom-10 right-10 text-yellow-300 animate-pulse delay-200">
        <Heart :size="24" />
      </div>
    </div>

    <LoginCard v-if="selectedTab === 'login'" @onRegisterClick="selectedTab = 'register'" />
    <RegisterCard v-else-if="selectedTab === 'register'" @onLoginClick="selectedTab = 'login'" />
  </div>
</template>