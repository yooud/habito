<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useFamilyStore } from '@/store/familyStore';
import Card from 'primevue/card';
import Button from 'primevue/button';
import { useAuthStore } from '@/store/authStore';
import { FamilyMember } from '@/types/family';
import { Star } from 'lucide-vue-next';
import AddMemberDialog from '@/components/family/AddMemberDialog.vue';
import UpdateMemberDialog from '@/components/family/UpdateMemberDialog.vue';
import { removeFamily } from "@/services/familyService"
import { useToast } from 'primevue';
import { useRouter } from 'vue-router';

const familyStore = useFamilyStore();
const authStore = useAuthStore();
const toast = useToast()
const router = useRouter();
const familyMembers = ref([]);
const currentUser = computed<FamilyMember>(() => familyMembers.value.find(member => member.uid === authStore.user.uid));
const isParent = computed(() => currentUser.value?.role === 'parent');
const parents = computed(() => familyMembers.value.filter(member => member.role === 'parent'));
const children = computed(() => familyMembers.value.filter(member => member.role === 'child'));
const updateMemberDialog = ref<Record<string, boolean>>({});
const addMemberDialog = ref(false);

const remove = async () => {
    try {
        const response = await removeFamily()
        if (response !== undefined) {
            toast.add({ severity: 'error', summary: 'Error', detail: response.error });
            return;
        }
        toast.add({ severity: 'success', summary: 'Success', detail: 'Family successfully deleted' })
        await router.push({ name:'home' })
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete family.' });
    }

};

onMounted(async () => {
    document.title = 'Family';
    familyMembers.value = familyStore.members;
    for (const member in familyStore.members) {
        updateMemberDialog[member.id] = false;
    }
});
</script>

<template>
    <div class="max-w-5xl mx-auto px-4 py-8">
        <div class="flex items-center justify-between mb-2">
            <span class="text-2xl font-bold mb-4 flex items-center">
                🧔‍♂️ Parents
            </span>
            <Button label="Delete Family" icon="pi pi-trash" severity="danger" class="rounded-2xl" @click="remove" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card v-for="parent in parents" :key="parent._id" class="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100">
                <template #content>
                    <div class="flex flex-col items-start justify-between w-full">
                        <div class="flex items-center space-x-3">
                            <div>
                                <h3 class="font-bold text-lg text-gray-800">{{ parent.name || 'No name' }}</h3>
                            </div>
                        </div>
                        
                        <div class="flex items-center justify-between w-full">
                            <div class="flex items-center space-x-1 text-yellow-600 py-2">
                                <Star :size=16 />
                                <span class="font-bold">{{ parent.points }} points</span>
                            </div>
                            <div class="flex flex-row items-center gap-1 ">
                                <Button 
                                    icon="pi pi-pencil" 
                                    variant="text" 
                                    :disabled="!isParent || currentUser.id === parent.id" 
                                    rounded 
                                    @click="updateMemberDialog[parent.id] = true" 
                                />
                            </div>  
                        </div>
                    </div>
                    <update-member-dialog v-model="updateMemberDialog[parent.id]" :member="parent" />
                </template>                    
            </Card>
        </div>

        <div class="flex items-center justify-between mb-2">
            <span class="text-2xl font-bold mb-4 flex items-center">
                👦 Children
            </span>
            <Button label="Add Member" icon="pi pi-plus" class="rounded-2xl" @click="addMemberDialog = true" />
            <add-member-dialog v-model="addMemberDialog" />
        </div>
        <Card v-if="children.length === 0" class="text-center border-0 shadow-lg rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50">
            <template #content>
                <div class="text-6xl mb-4">👦</div>
                <h3 class="text-xl font-bold text-gray-700 mb-2">No children added!</h3>
                <p class="text-gray-500">
                </p>
            </template>
        </Card>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card v-for="child in children" :key="child._id" class="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100">
                <template #content>
                    <div class="flex flex-col items-start justify-between w-full">
                        <div class="flex items-center space-x-3">
                            <div>
                                <h3 class="font-bold text-lg text-gray-800">{{ child.name || 'No name' }}</h3>
                            </div>
                        </div>
                        
                        <div class="flex items-center justify-between w-full">
                            <div class="flex items-center space-x-1 text-yellow-600 py-2">
                                <Star :size=16 />
                                <span class="font-bold">{{ child.points }} points</span>
                            </div>
                            <div class="flex flex-row items-center gap-1">
                                <Button 
                                    icon="pi pi-pencil" 
                                    variant="text" 
                                    :disabled="!isParent" 
                                    rounded 
                                    @click="updateMemberDialog[child.id] = true" 
                                />
                            </div>  
                        </div>
                    </div>
                    <update-member-dialog v-model="updateMemberDialog[child.id]" :member="child" />
                </template>                    
            </Card>
        </div>
    </div>
</template>