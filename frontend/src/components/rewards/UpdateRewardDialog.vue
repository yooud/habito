<script lang="ts" setup>
import { computed, ref, onMounted } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Message from "primevue/message";
import { Form } from "@primevue/forms";
import { useToast } from "primevue/usetoast";
import { FormResolverOptions, FormSubmitEvent } from "@primevue/forms/form";
import { updateReward } from "@/services/rewardService";
import { Reward } from "@/types/rewards";

const toast = useToast();
const isLoading = ref(false);
const isError = ref(false);

const initialValues = ref({
  name: "",
  description: "",
  points: 5,
  emoji: "🎁",
});

const props = defineProps<{
  modelValue: boolean;
  reward: Reward;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "updated"): void;
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const resolver = ({ values }: FormResolverOptions) => {
  const errors: Record<string, Record<string, string>[]> = {
    name: [],
    description: [],
    points: [],
  };

  if (!values.name) {
    errors.name.push({ message: "Name is required." });
  } else if (values.name.length < 2) {
    errors.name.push({
      type: "minLength",
      message: "Name must be at least 2 characters long.",
    });
  }

  if (!values.description) {
    errors.description.push({ message: "Description is required." });
  } else if (values.description.length < 5) {
    errors.description.push({
      type: "minLength",
      message: "Description must be at least 5 characters long.",
    });
  }

  if (values.points == null || values.points < 0) {
    errors.points.push({ message: "Points must be a positive number." });
  }

  return {
    values,
    errors
  };
};

const onFormSubmit = async ({ valid, values }: FormSubmitEvent) => {
  if (!valid) {
    return;
  }

  const success = await update(values);
  if (success) {
    isOpen.value = false;
    emit("updated");
  }
};

const update = async (values: Record<string, any>): Promise<boolean> => {
  try {
    isLoading.value = true;

    await updateReward(props.reward._id, {
      title: values.name.trim(),
      description: values.description.trim(),
      pointsRequired: values.points,
      emoji: values.emoji?.trim() || '🎁'
    })

    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Reward updated successfully",
      life: 3000,
    });
    return true;
  } catch (error) {
    console.error("Error updating reward:", error);
    isError.value = true;
    setTimeout(() => {
      isError.value = false;
    }, 3500);
    return false;
  } finally {
    isLoading.value = false;
  }
};

defineExpose({
  isOpen,
});

onMounted(() => {
  console.log(props.reward);
  initialValues.value = {
    name: props.reward.title,
    description: props.reward.description,
    points: props.reward.pointsRequired,
    emoji: props.reward.emoji || "🎁",
  };
});
</script>

<template>
  <Dialog
    v-model:visible="isOpen"
    modal
    header="Update Reward"
    :draggable="false"
    :style="{ width: '30rem' }"
  >
    <Form
      v-slot="$form"
      :resolver
      :initialValues="initialValues"
      @submit="onFormSubmit"
      class="flex flex-col gap-4 w-full"
    >
      <div class="flex flex-col gap-1">
        <label for="name" class="font-medium text-sm">Name</label>
        <div class="flex flex-row items-center gap-2">
          <InputText
            name="emoji"
            type="text"
            fluid
            class="rounded-xl w-12"
            placeholder="😀"
            maxlength="2"
            v-keyfilter="/^\p{Emoji}+$/u"
            :invalid="$form.name?.invalid"
          />
          <InputText
            name="name"
            type="text"
            placeholder="Name"
            fluid
            class="rounded-xl"
            :invalid="$form.name?.invalid"
          />
        </div>
        <Message
          v-if="$form.name?.invalid"
          severity="error"
          size="small"
          variant="simple"
        >
          {{ $form.name.error?.message }}
        </Message>
      </div>

      <div class="flex flex-col gap-1">
        <label for="description" class="font-medium text-sm">Description</label>
        <InputText
          name="description"
          type="text"
          placeholder="Description"
          fluid
          class="rounded-xl"
          :invalid="$form.description?.invalid"
        />
        <Message
          v-if="$form.description?.invalid"
          severity="error"
          size="small"
          variant="simple"
        >
          {{ $form.description.error?.message }}
        </Message>
      </div>

      <div class="flex flex-col gap-1">
        <label for="points" class="font-medium text-sm">Required points</label>
        <InputNumber
          name="points"
          inputId="minmax-buttons"
          mode="decimal"
          showButtons
          :min="0"
          fluid
          :invalid="$form.points?.invalid"
        />
        <Message
          v-if="$form.points?.invalid"
          severity="error"
          size="small"
          variant="simple"
        >
          {{ $form.points.error?.message }}
        </Message>
      </div>

      <Message v-if="isError" severity="error" :life="3000">
        Error updating reward. Please try again.
      </Message>


      <div class="flex justify-end gap-2">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          @click="isOpen = false"
        />
        <Button
          type="submit"
          severity="primary"
          label="Update"
          :loading="isLoading"
        />
      </div>
    </Form>
  </Dialog>
</template>
