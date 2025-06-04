<script lang="ts" setup>
import { computed, ref } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import Message from "primevue/message";
import { Form } from "@primevue/forms";
import { useToast } from "primevue/usetoast";
import { FormResolverOptions, FormSubmitEvent } from "@primevue/forms/form";
import { addFamilyMember } from "@/services/familyService";

const toast = useToast();
const isLoading = ref(false);
const isError = ref(false);

const roles = [
  { label: "Parent", value: "parent" },
  { label: "Child", value: "child" },
];

const initialValues = ref({
  name: "",
  role: "child",
});

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "added"): void;
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const resolver = ({ values }: FormResolverOptions) => {
  const errors: Record<string, Record<string, string>[]> = {
    name: [],
    role: [],
    email: [],
  };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!values.email) {
        errors.email.push({ message: 'Email is required.' });
    } else if (!emailRegex.test(values.email)) {
        errors.email.push({ type: 'format', message: 'Email is invalid.' });
    }

    if (!values.role) {
        errors.role.push({ message: "Role is required." });
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

  const success = await create(values);
  if (success) {
    isOpen.value = false;
    emit("added");
  }
};

const create = async (values: Record<string, any>): Promise<boolean> => {
  try {
    isLoading.value = true;

    await addFamilyMember({
      email: values.email,
      role: values.role,
    });

    toast.add({
      severity: "success",
      summary: "Success",
      detail: "New member added",
      life: 3000,
    });
    return true;
  } catch (error) {
    console.error("Error adding new member:", error);
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
</script>

<template>
    <Dialog
        v-model:visible="isOpen"
        modal
        header="Add Member"
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
                <label for="email" class="font-medium text-sm" >Email</label>
                <InputText name="email" type="text" placeholder="Email" fluid class="rounded-xl" />
                <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">{{ $form.email.error?.message }}</Message>
            </div>

            <div class="flex flex-col gap-1">
                <label for="role" class="font-medium text-sm">Role</label>
                <Select
                    name="role"
                    type="text"
                    placeholder="Role"
                    fluid
                    :options="roles"
                    option-label="label"
                    option-value="value"
                    class="rounded-xl"
                    :invalid="$form.role?.invalid"
                />
                <Message
                    v-if="$form.role?.invalid"
                    severity="error"
                    size="small"
                    variant="simple"
                >
                {{ $form.role.error?.message }}
                </Message>
            </div>

            <Message v-if="isError" severity="error" :life="3000">
                Error adding new member. Please try again.
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
                    label="Add"
                    :loading="isLoading"
                />
            </div>
        </Form>
    </Dialog>
</template>
