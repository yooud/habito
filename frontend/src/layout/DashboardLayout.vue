<script lang="ts" setup>
import router from '@/router';
import Button from 'primevue/button';
import { Sparkles } from 'lucide-vue-next';

import { ref } from 'vue';

const currentView = ref('dashboard');
const views = [{
    name: '🏠 Dashboard',
    value: 'dashboard'
    }, {
    name: '👤 Profile',
    value: 'profile'
    }, {
    name: '🏆 Rewards',
    value: 'rewards'
}];

const changeView = (view: string) => {
    currentView.value = view;
    router.push({ name: view });
};

</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <header class="bg-white shadow-lg border-b-4 border-purple-200">
        <div class="max-w-7xl mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Habito
              </h1>
              <Sparkles class="text-yellow-500 animate-pulse" />
            </div>
            
            <nav class="flex items-center space-x-2">
              <Button v-for="view in views"
                :key="view.value"
                @click="changeView(view.value)"
                :variant="currentView === view.value ? 'primary' : 'text'"
                class="rounded-xl font-medium"
                :label=view.name
              />
            </nav>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 py-8">
        <router-view />
      </main>
    </div>
</template>