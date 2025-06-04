<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { FamilyMember } from '@/types/family';
import { Gift, ShoppingCart, Star } from 'lucide-vue-next';
import Card from 'primevue/card';
import { useFamilyStore } from '@/store/familyStore';
import { useAuthStore } from '@/store/authStore';
import Button from 'primevue/button';
import CreateRewardDialog from '@/components/rewards/CreateRewardDialog.vue';
import UpdateRewardDialog from '@/components/rewards/UpdateRewardDialog.vue';
import { getRewards, redeemReward, getRedeemedRewards, removeReward } from '@/services/rewardService';
import { RedeemedReward } from '@/types/rewards';
import { useToast } from 'primevue';
import { Reward } from '@/types/rewards';

const familyStore = useFamilyStore();
const authStore = useAuthStore();
const toast = useToast();
const familyMembers = ref<FamilyMember[]>([]);
const currentUser = computed<FamilyMember>(() => familyMembers.value.find(member => member.uid === authStore.user.uid));
const isParent = computed(() => currentUser.value?.role === 'parent');
const createRewardDialog = ref(false);
const updateRewardDialog = ref<Record<string, boolean>>({});
const rewards = ref<Reward[]>([]);
const availableRewards = computed(() => rewards.value.filter(reward => !redeemedRewards.value.some(r => r.id === reward._id)));
const redeemedRewards = ref<Reward[]>([]);
const totalPoints = computed(() => {
    return currentUser.value ? currentUser.value.points : 0;
});

const updateRewards = async () => {
    try {
        const response = await getRewards();
        if ('error' in response) {
            toast.add({ severity: 'error', summary: 'Error', detail: response.error });
            return;
        } 
        rewards.value = response as Reward[];

        const redeemedResponse = await getRedeemedRewards();
        if ('error' in redeemedResponse) {
            toast.add({ severity: 'error', summary: 'Error', detail: redeemedResponse.error });
            return;
        }
        redeemedRewards.value = (redeemedResponse as RedeemedReward[]).map(reward => reward.reward);
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load rewards.' });
    }

    for (const reward in rewards.value) {
        updateRewardDialog[reward.id] = false;
    }
};

const redeem = async (reward: Reward) => {
    if (!currentUser.value) {
        toast.add({ severity: 'warn', summary: 'Warning', detail: 'You must be logged in to redeem rewards.' });
        return;
    }
    try {
        const response = await redeemReward(reward._id);
        if ('error' in response) {
            toast.add({ severity: 'error', summary: 'Error', detail: response.error });
            return;
        }
        toast.add({ severity: 'success', summary: 'Success', detail: 'Reward redeemed successfully!' });
        updateRewards();
        currentUser.value.points -= reward.pointsRequired;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to redeem reward.' });
    }
};

const remove = async (reward: Reward) => {
    var response = await removeReward(reward._id);
    if (response !== undefined) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to remove reward',
            life: 3000
        });
        return;
    } else {
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Reward removed successfully',
            life: 3000
        });
        updateRewards();
    }
};

onMounted(async () => {
    document.title = 'Rewards';
    familyMembers.value = familyStore.members
    updateRewards();
});
</script>

<template>
    <div class="flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div v-if="!isParent" class="w-full grid grid-cols-1 mb-8 gap-6">
            <Card class="text-white border-0 shadow-lg rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500">
                <template #content>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <Star :size=40 class="text-yellow-200" />
                            <div>   
                                <h2 class="text-2xl font-bold">Your Points</h2>
                                <p class="text-yellow-100">Ready to spend on awesome rewards!</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-5xl font-bold">{{ totalPoints }}</p>
                            <p class="text-yellow-100">points</p>
                        </div>
                    </div>
                </template>  
            </Card>
        </div>
        <div v-else class="w-full max-w-2xl flex flex-col items-center mb-6">
            <Button label="Add new reward" icon="pi pi-plus" class="rounded-2xl w-64" @click="createRewardDialog = true" />
            <create-reward-dialog v-model="createRewardDialog" @added="updateRewards" />
        </div>
        <div class="w-full">
            <span class="text-2xl font-bold text-gray-800 flex items-center mb-6">
                <Gift class="mr-3 text-purple-500" :size=28 />
                Available Rewards
            </span>
            <Card v-if="availableRewards.length === 0" class="text-center border-0 shadow-lg rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50">
                <template #content>
                    <div class="text-6xl mb-4">🎁</div>
                    <h3 class="text-xl font-bold text-gray-700 mb-2">No rewards available!</h3>
                    <p class="text-gray-500">
                    </p>
                </template>
            </Card>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card v-for="reward in availableRewards" :key="reward._id" class="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100">
                    <template #content>
                        <div class="flex flex-col items-start justify-between w-full">
                            <div class="flex items-center space-x-3">
                                <span class="text-4xl">{{ reward.emoji }}</span>
                                <div>
                                    <h3 class="font-bold text-lg text-gray-800">{{ reward.title }}</h3>
                                    <p class="text-sm text-gray-600">{{ reward.description }}</p>
                                </div>
                            </div>
                            
                            <div class="flex items-center justify-between w-full">
                                <div class="flex items-center space-x-1 text-yellow-600 py-2">
                                    <Star :size=16 />
                                    <span class="font-bold">{{ reward.pointsRequired }} points</span>
                                </div>
                                <div v-if="isParent" class="flex flex-row items-center gap-1">
                                    <Button icon="pi pi-pencil" variant="text" rounded @click="updateRewardDialog[reward.id] = true" />
                                    <Button icon="pi pi-trash" variant="text" rounded @click="remove(reward)" />

                                    <update-reward-dialog v-model="updateRewardDialog[reward.id]" :reward="reward" @updated="updateRewards" />
                                </div>  

                                <Button
                                    v-else
                                    @click="redeem(reward)"
                                    variant="text"
                                    class="rounded-xl font-medium bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                                    icon="pi pi-shopping-cart"
                                    :disabled="totalPoints < reward.pointsRequired"
                                    label="Buy now"
                                />
                            </div>
                        </div>
                    </template>                    
                </Card>
            </div>
        </div>
        <div class="w-full" v-if="!isParent && redeemedRewards.length > 0">
            <span class="text-2xl font-bold text-gray-800 flex items-center mb-6">
                <ShoppingCart class="mr-3 text-green-500" :size=28 />
                Redeemed Rewards
            </span>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card v-for="reward in redeemedRewards" :key="reward._id" class="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-green-300 to-green-500">
                    <template #content>
                        <div class="flex flex-col items-start justify-between w-full">
                            <div class="flex items-center space-x-3">
                                <span class="text-4xl">{{ reward.emoji }}</span>
                                <div>
                                    <h3 class="font-bold text-lg text-gray-800">{{ reward.title }}</h3>
                                    <p class="text-sm text-gray-600">{{ reward.description }}</p>
                                </div>
                            </div>
                            
                            <div class="flex items-center justify-between w-full">
                                <div class="flex items-center space-x-1 text-yellow-600 py-2">
                                    <Star :size=16 />
                                    <span class="font-bold">{{ reward.pointsRequired }} points</span>
                                </div>
                                <Button
                                    variant="text"
                                    @click="redeem(reward)"
                                    class="text-gray-600"
                                    icon="pi pi-check"
                                    :disabled=true
                                />
                            </div>
                        </div>
                    </template>                    
                </Card>
            </div>
        </div>
    </div>
</template>