<script lang="ts" setup>
import { ref } from 'vue';
import Card from 'primevue/card';
import Button from "primevue/button";
import { useRouter } from 'vue-router';
import { useFamilyStore } from '@/store/familyStore';
import { useToast } from 'primevue';
import { Sparkles } from 'lucide-vue-next';

const router = useRouter();
const isLoading = ref(false);
const familyStore = useFamilyStore();
const toast = useToast();
const userType = ref<'child' | 'parent' | null>(null);

const emit = defineEmits(['onRegisterClick', 'onSuccess']);

const createFamily = async () => {
  isLoading.value = true;
  try {
    const response = await familyStore.createFamily({ name: 'My Family' });
    if ('error' in response) {
      toast.add({ severity: 'error', summary: 'Error', detail: response.message, life: 3000 });
    } else {
      toast.add({ severity: 'success', summary: 'Family Created', detail: 'Your family has been created successfully!', life: 3000 });
      await router.push({ name: 'dashboard' });
    }
  } catch (error) {
    console.error('Error creating family:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to create family. Please try again.', life: 3000 });
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <Card class="max-w-md w-full h-[60vh] p-6 bg-white/90 backdrop-blur-lg shadow-2xl border-0 rounded-3xl relative z-10">
    <template #title>
      <div class="flex flex-col items-center relative mb-6">
        <h1 class="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Habito
        </h1>
        <div class="absolute -top-2 -right-2 text-yellow-400">
          <Sparkles :size="24" class="animate-spin" />
        </div>
      </div>
      <p class="text-base md:text-lg text-gray-600 font-medium text-center mb-4">
        🌟 Track your habits and earn awesome rewards! 🌟
      </p>
    </template>

    <template #content>
      <div class="flex flex-col items-center justify-center h-full space-y-6">
        <div v-if="userType === null" class="flex flex-col items-center space-y-4 w-full">
          <span class="text-lg font-semibold text-gray-700">Select who you are:</span>
          <Button
            label="👶 I am a Child"
            class="w-full py-3 text-lg bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold rounded-xl shadow-md transition transform hover:scale-105"
            @click="userType = 'child'"
          />
          <Button
            label="👨‍👩‍👧 I am a Parent"
            class="w-full py-3 text-lg bg-green-100 hover:bg-green-200 text-green-800 font-semibold rounded-xl shadow-md transition transform hover:scale-105"
            @click="userType = 'parent'"
          />
        </div>

        <div v-else-if="userType === 'child'" class="flex flex-col items-center space-y-3">
          <div class="text-xl text-blue-700 font-medium">⏳ Please wait for an invite from your parent…</div>
          <span class="text-4xl">🧸✨</span>
        </div>

        <div v-else-if="userType === 'parent'" class="flex flex-col items-center space-y-4 w-full">
          <div class="text-lg font-medium text-green-700">Ready to build your family? 👪</div>
          <Button
            label="👪 Create Family"
            class="w-full py-3 text-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-lg transition transform hover:scale-105"
            :loading="isLoading"
            @click="createFamily"
          />
        </div>
      </div>
    </template>
  </Card>
</template>
