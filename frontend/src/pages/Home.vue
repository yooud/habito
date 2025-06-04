<script setup lang="ts">
import { Sparkles, Star, Trophy, Heart, Check } from 'lucide-vue-next';
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-400 via-purple-300 to-purple-200 flex flex-col items-center justify-center p-4 relative overflow-hidden">
    <!-- Animated Background Icons -->
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

    <header class="w-full z-10">
      <div class="max-w-4xl mx-auto flex items-center justify-between px-6 py-6">
        <div class="flex items-center space-x-2">
          <h1 class="text-3xl font-extrabold bg-gradient-to-r from-green-500 to-lime-500 bg-clip-text text-transparent">
            Habito
          </h1>
          <Sparkles class="text-yellow-500 animate-pulse" />
        </div>

        <nav class="flex space-x-6">
          <a href="#" class="text-white hover:underline">About us</a>
          <a href="#" class="text-white hover:underline">Pricing</a>
        </nav>
      </div>
    </header>

    <main class="w-full flex-1 flex flex-col items-center justify-center pt-24 z-10">
      <div class="text-center space-y-4 px-4">
        <div class="flex items-center justify-center space-x-2">
          <Check class="text-green-500" :size="48" />
          <h2 class="text-5xl font-extrabold text-white">
            Habito
          </h2>
        </div>
        <p class="text-xl text-white">
          Small Steps, Big Wins – Build Better Habits with Habito!
        </p>
      </div>

      <div class="mt-12 bg-yellow-100/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-md text-center">
        <h3 class="text-2xl font-semibold text-gray-800 mb-4">
          Welcome to Habito – Your Fun Habit Tracker for Kids!
        </h3>
        <p class="text-gray-700 mb-6">
          Start building great habits every day with your cheerful helper. Easy to use, playful, and made just for kids!
        </p>
        <button @click="$router.push({ name: 'dashboard' })"
          class="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full transition-colors"
        >
          Let’s Start!
        </button>
      </div>
    </main>
  </div>
</template>