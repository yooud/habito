<script lang="ts" setup>
import { ref } from 'vue';
import Card from 'primevue/card'
import { Form } from '@primevue/forms';
import Password from 'primevue/password';
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Message from 'primevue/message';
import Divider from 'primevue/divider';
import { useRouter } from 'vue-router';
import { FormResolverOptions, FormSubmitEvent } from "@primevue/forms/form";
import { useAuthStore } from '@/store/authStore';
import { useToast } from 'primevue';
import { Sparkles } from 'lucide-vue-next';

const router = useRouter();
const isLoading = ref(false);
const authStore = useAuthStore();
const toast = useToast();

const emit = defineEmits(['onLoginClick', 'onSuccess']);

const resolver = ({ values }: FormResolverOptions) => {
  const errors: Record<string, Record<string, string>[]> = {
    name: [],
    email: [],
    password: []
  };

  if (!values.name) {
    errors.name = [{ message: 'Name is required.' }];
  } else if (values.name.length < 2) {
    errors.name = [{ type: 'minLength', message: 'Name must be at least 2 characters long.' }];
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!values.email) {
    errors.email.push({ message: 'Email is required.' });
  } else if (!emailRegex.test(values.email)) {
    errors.email.push({ type: 'format', message: 'Email is invalid.' });
  }

  if (!values.password) {
    errors.password = [{ message: 'Password is required.' }];
  } else if (values.password.length < 6) {
    errors.password = [{ type: 'minLength', message: 'Password must be at least 6 characters long.' }];
  }

  return {
    values,
    errors
  };
};

const onFormSubmit = ({ valid, values }: FormSubmitEvent) => {
  if (valid) {
    register(values).then();
  }
};

const register = async (values: Record<string, any>): Promise<boolean> => {
  isLoading.value = true;

  try {
    if (await authStore.register(values.email, values.password, values.name)) {
      toast.add({ severity: 'success', summary: 'Success', detail: 'Account created successfully!', life: 3000 });
    } else {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Email already exists', life: 3000 });
      return false;
    }
    emit('onSuccess')
    return true;
  } catch (error) {
    console.error("Registration error:", error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'There was an error signing in', life: 3000 });
    return false;
  } finally {
    isLoading.value = false;
  }
};

const handleGoogleLogin = async () => {
  try {
    if (!await authStore.loginWithGoogle()) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to login with Google', life: 3000 });
      return;
    }
    emit('onSuccess')
  } catch (error) {
    console.error("Error logging in with Google:", error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'There was an error signing in with Google', life: 3000 });
  }
};
</script>

<template>
  <Card class="max-w-md w-full p-4 bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-3xl relative z-10">
    <template #title>
      <div class="flex flex-col items-center relative mb-6">
        <h1 class="text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Habito
        </h1>
        <div class="absolute -top-2 -right-2 text-yellow-400">
          <Sparkles :size="24" class="animate-spin" />
        </div>
      </div>
      <p class="text-lg text-gray-600 font-medium text-center mb-2">
        🌟 Track your habits and earn awesome rewards! 🌟
      </p>
    </template>
    <template #content>
        <Form v-slot="$form" :resolver @submit="onFormSubmit" class="flex flex-col gap-4 w-full">
          <div class="flex flex-col gap-1">
            <label for="name" class="font-medium text-sm" >Name</label>
            <InputText name="Name" type="text" placeholder="Name" fluid class="rounded-xl" />
            <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">{{ $form.name.error?.message }}</Message>
          </div>

          <div class="flex flex-col gap-1">
            <label for="email" class="font-medium text-sm" >Email</label>
            <InputText name="email" type="text" placeholder="Email" fluid class="rounded-xl" />
            <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">{{ $form.email.error?.message }}</Message>
          </div>

          <div class="flex flex-col gap-1">
            <label for="password" class="font-medium text-sm" >Password</label>
            <Password 
              name="password" 
              placeholder="Password" 
              :feedback="false" 
              toggleMask 
              fluid 
              :pt="{ pcInputText: {
                root: 'rounded-xl'
              } }"
            />
            <template v-if="$form.password?.invalid">
              <Message v-for="(error, index) of $form.password.errors" :key="index" severity="error" size="small" variant="simple">{{ error.message }}</Message>
            </template>
          </div>

          <Button 
            type="submit" 
            severity="primary" 
            label="🎉 Create Account" 
            size="large" 
            :loading="isLoading"
            class="font-bold rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200" 
          />
        </Form>

        <Divider align="center" :pt="{ content: 'bg-white/10' }">
          or
        </Divider>

        <Button 
          label="Continue with Google"
          @click="handleGoogleLogin" 
          severity="secondary" 
          icon="pi pi-google" 
          size="large"
          class="w-full mb-2 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-3"
        />
  
        <div class="text-center">
          <Button
            label="Already have an account? Login"
            variant="link"
            size="small"
            @click="emit('onLoginClick');"
            class="text-purple-600 hover:text-purple-700 font-medium"
          />
        </div>
    </template>
  </Card>
</template>