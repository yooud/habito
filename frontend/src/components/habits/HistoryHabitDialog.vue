<script lang="ts" setup>
import { computed, ref, onMounted } from "vue";
import Dialog from "primevue/dialog";
import Message from "primevue/message";
import { getHabitCompletions } from "@/services/habitService";
import type { FamilyMember } from "@/types/family";
import type { Habit, HabitCompletionResponse } from "@/types/habit";

const completions = ref<HabitCompletionResponse[]>([]);

const props = defineProps<{
  modelValue: boolean;
  members: FamilyMember[];
  habit: Habit;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

defineExpose({
  isOpen,
});

onMounted(async () => {
  const response = await getHabitCompletions(props.habit._id);
  if ("error" in response) {
    console.error(response.error);
    return;
  }
  completions.value = response;
});

const formattedCompletions = computed(() =>
  completions.value.map((c) => {
    const date = new Date(c.completedAt);
    const formattedDate = date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const userName =
      props.members.find((m) => m.id === c.user.id)?.name || "Unknown";
    return {
      id: c._id,
      date: formattedDate,
      user: userName,
    };
  })
);
</script>

<template>
  <Dialog
    v-model:visible="isOpen"
    modal
    header="History of Habit Completions"
    :draggable="false"
    :style="{ width: '32rem' }"
    :closable="true"
  >
    <div class="flex flex-col gap-4">
      <div>
        <div class="font-bold text-xl mb-1">{{ props.habit.title }}</div>
        <div class="text-sm text-gray-600">{{ props.habit.description }}</div>
      </div>

      <div v-if="!completions.length" class="mt-4">
        <Message
          severity="info"
          text="No completions recorded yet."
          class="w-full text-center"
        />
      </div>

      <div
        v-else
        class="max-h-64 overflow-y-auto divide-y divide-gray-200 border rounded-md"
      >
        <div
          v-for="item in formattedCompletions"
          :key="item.id"
          class="flex justify-between items-center py-2 px-3"
        >
          <div class="text-sm text-gray-800">{{ item.date }}</div>
          <div class="text-sm font-semibold text-gray-600">
            {{ item.user }}
          </div>
        </div>
      </div>
    </div>
  </Dialog>
</template>