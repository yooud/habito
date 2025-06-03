import { createApp } from 'vue'
import '@/assets/styles.scss'
import PrimeVue from 'primevue/config';
import App from './App.vue'
import { createPinia } from 'pinia';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { ConfirmationService, Ripple, ToastService } from 'primevue';
import router from './router';

const MyPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{purple.50}',
            100: '{purple.100}',
            200: '{purple.200}',
            300: '{purple.300}',
            400: '{purple.400}',
            500: '{purple.500}',
            600: '{purple.600}',
            700: '{purple.700}',
            800: '{purple.800}',
            900: '{purple.900}',
            950: '{purple.950}'
        }
    }
});

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: MyPreset,
        options: {
            cssLayer: {
                name: 'primevue',
                order: 'tailwind-base, primevue, tailwind-utilities'
            },
            darkModeSelector: '.app-dark'
        }
    },
    ripple: true
});
app.directive('ripple', Ripple);
app.use(ToastService);
app.use(ConfirmationService);

app.mount('#app')
