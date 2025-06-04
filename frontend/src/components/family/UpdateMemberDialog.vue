<script lang="ts" setup>
import { computed, ref, onMounted } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import Message from "primevue/message";
import { Form } from "@primevue/forms";
import { useToast } from "primevue/usetoast";
import { FormResolverOptions, FormSubmitEvent } from "@primevue/forms/form";
import { updateFamilyMember } from "@/services/familyService";
import { FamilyMember } from "@/types/family";

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
  member: FamilyMember;
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
    role: [],
  };

    if (!values.name) {
      errors.name = [{ message: 'Name is required.' }];
    } else if (values.name.length < 2) {
      errors.name = [{ type: 'minLength', message: 'Name must be at least 2 characters long.' }];
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
    emit("updated");
  }
};

const create = async (values: Record<string, any>): Promise<boolean> => {
  try {
    isLoading.value = true;
    console.log(values)

    await updateFamilyMember(props.member.id, {
      name: values.name,
      role: values.role,
    });

    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Member updated",
      life: 3000,
    });
    return true;
  } catch (error) {
    console.error("Error updating member:", error);
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
  console.log(props.member)
  initialValues.value = {
    name: props.member.name,
    role: props.member.role
  }
})
</script>

<template>
    <Dialog
        v-model:visible="isOpen"
        modal
        header="Update Member"
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
              <label for="name" class="font-medium text-sm" >Name</label>
              <InputText name="name" type="text" placeholder="Name" fluid class="rounded-xl" />
              <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">{{ $form.name.error?.message }}</Message>
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
                Error updating member. Please try again.
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
