<script setup lang="ts">
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';
</script>

<template>
  <router-view />
  <ConfirmDialog />
  <Toast />
</template>

<style scoped></style>
