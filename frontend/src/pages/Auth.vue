<script setup lang="ts">
import { onMounted, ref } from 'vue'
import LoginCard from '@/components/auth/LoginCard.vue'
import RegisterCard from '@/components/auth/RegisterCard.vue'
import CreateFamilyCard from '@/components/family/CreateFamilyCard.vue'
import { Sparkles, Star, Trophy, Heart } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { useFamilyStore } from '@/store/familyStore';
import { useAuthStore } from '@/store/authStore';

const router = useRouter();
const authStore = useAuthStore();
const familyStore = useFamilyStore();
const selectedTab = ref<'login' | 'register' | 'family'>('login');

const onSuccess = async () => {
  const family = await familyStore.fetchFamily();
  console.log('Family fetched:', family);
  if (!family) {
    selectedTab.value = 'family';
  } else {
    await router.push({name: 'dashboard'});
  }
}

onMounted(async () => {
  document.title = 'Habito - Login';
  if (authStore.user) {
    const family = await familyStore.fetchFamily();
    if (!family) {
      selectedTab.value = 'family';
    } else {
      router.push({ name: 'dashboard' });
    }
  }
});
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

    <LoginCard v-if="selectedTab === 'login'" @onRegisterClick="selectedTab = 'register'" @onSuccess="onSuccess" />
    <RegisterCard v-else-if="selectedTab === 'register'" @onLoginClick="selectedTab = 'login'" @onSuccess="onSuccess" />
    <CreateFamilyCard v-else-if="selectedTab === 'family'" />
  </div>
</template>