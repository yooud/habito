<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { FamilyMember, FamilyResponse } from '@/types/family';
import { Plus, Check, Star, Target } from 'lucide-vue-next';
import Card from 'primevue/card';
import { useFamilyStore } from '@/store/familyStore';
import { useAuthStore } from '@/store/authStore';
import Button from 'primevue/button';
import CreateHabitDialog from '@/components/habits/CreateHabitDialog.vue';
import UpdateHabitDialog from '@/components/habits/UpdateHabitDialog.vue';
import HistoryHabitDialog from '@/components/habits/HistoryHabitDialog.vue';
import { CompleteHabitResponse, Habit, HabitCompletionResponse, SCHEDULE_DAYS } from '@/types/habit';
import { completeHabit, getHabitCompletions, getHabits, getMyHabits, removeHabit } from '@/services/habitService';
import { useToast } from 'primevue';

const familyStore = useFamilyStore();
const authStore = useAuthStore();
const toast = useToast();
const familyMembers = ref<FamilyMember[]>([]);
const currentUser = computed<FamilyMember>(() => familyMembers.value.find(member => member.uid === authStore.user.uid));
const isParent = computed(() => currentUser.value?.role === 'parent');
const createHabitDialog = ref(false);
const updateHabitDialog = ref(false);
const historyHabitDialog = ref(false);
const habits = ref<Habit[]>([]);
const completions = ref<Record<string, HabitCompletionResponse[]>>({});

const cards = ref([
    {
        title: 'Total Points',
        value: 0,
        icon: Star,
        gradient: 'from-yellow-400 to-orange-500',
        textColor: 'text-yellow-100'
    },
    {
        title: 'Completed Today',
        value: 0,
        icon: Check,
        gradient: 'from-green-400 to-blue-500',
        textColor: 'text-green-100'
    },
    {
        title: 'Total Habits',
        value: 0,
        icon: Target,
        gradient: 'from-purple-400 to-pink-500',
        textColor: 'text-purple-100'
    }
]);

const updateHabits = async () => {
    if (currentUser.value?.role === 'parent') {
        const response = await getHabits();
        if ('error' in response) {
            console.error(response.error);
            return;
        }
        habits.value = response;
    } else {
        const response = await getMyHabits();
        if ('error' in response) {
            console.error(response.error);
            return;
        }
        habits.value = response.map(habit => habit.habit);
        for (const habit of habits.value) {
            const completitionResponse = await getHabitCompletions(habit.id);
            if ('error' in completitionResponse) {
                console.error(completitionResponse.error);
                continue;
            }
            completions.value[habit.id] = completitionResponse as HabitCompletionResponse[];
        }
    }

    cards.value[0].value = currentUser.value?.points || 0;
    cards.value[1].value = habits.value.filter(habit => isCompleted(habit.id)).length;
    cards.value[2].value = habits.value.length;
};

const remove = async (habit: Habit) => {
    var response = await removeHabit(habit._id);
    if (response !== undefined) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to remove habit',
            life: 3000
        });
        return;
    } else {
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Habit removed successfully',
            life: 3000
        });
        habits.value = habits.value.filter(h => h._id !== habit._id);
        delete completions.value[habit._id];
    }
};

const complete = async (habit: Habit) => {
    var response = await completeHabit(habit.id);
    if ('error' in response) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message,
            life: 3000
        });
        return;
    } else {
        await updateHabits(); 
        cards.value[0].value += (response as CompleteHabitResponse).pointsEarned;
    }
}

const isCompleted = (habitId: string): boolean => {
    if (!completions.value[habitId]) return false;
    return completions.value[habitId].some(completion => isToday(new Date(completion.completedAt)));
};

const isToday = (date: Date): boolean =>  {  
    const now = new Date()

    return date.getDate() === now.getDate() &&
         date.getMonth() === now.getMonth() &&
         date.getFullYear() === now.getFullYear()
}

const isScheduledToday = (habit: Habit): boolean => {
  const todayIndex = new Date().getDay();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayName = dayNames[todayIndex];
  return habit.schedule.includes(todayName as SCHEDULE_DAYS);
};

onMounted(async () => {
    document.title = 'Dashboard';
    familyMembers.value = familyStore.members
    await updateHabits();
});

</script>

<template>
    <div class="flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div v-if="!isParent" class="w-full grid grid-cols-1 mb-8 md:grid-cols-3 gap-6">
            <Card 
                v-for="card in cards" 
                key="card.title" 
                class="text-white border-0 shadow-lg rounded-2xl"
                :class="`bg-gradient-to-br ${card.gradient}`"
            >
                <template #content>
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="font-medium" :class="card.textColor" >{{ card.title }}</p>
                            <p class="text-3xl font-bold">{{ card.value }}</p>
                        </div>
                        <component 
                            :is="card.icon" 
                            :size="40" 
                            :class="card.textColor" 
                        />
                    </div>
                </template>  
            </Card>
        </div>
        <div v-else class="w-full max-w-2xl flex flex-col items-center">
            <Button label="Add new habit" icon="pi pi-plus" class="rounded-2xl w-64" @click="createHabitDialog = true" />
            <create-habit-dialog v-model="createHabitDialog" :members="familyMembers" @added="updateHabits" />
        </div>
        <div v-if="habits.length !== 0" class="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card 
                v-for="habit in habits" 
                key="habit.title" 
                class="text-white border-0 shadow-lg rounded-2xl transition-all duration-300 transform hover:scale-105"
                :class="{ 'bg-gradient-to-br from-green-200 to-green-500 text-white': isCompleted(habit.id), 
                          'bg-white hover:shadow-xl': !isCompleted(habit.id) }"
            >
                <template #content>
                    <div class="flex items-center justify-between">
                        <div class="w-full">
                            <div class="flex items">
                                <span class="text-3xl">{{ habit.emoji }}</span>
                                <div class="flex flex-col ml-2">
                                    <p class="font-bold text-lg text-gray-800" >{{ habit.title }}</p>
                                    <p class="text-sm text-gray-600">{{ habit.description }}</p>
                                </div>  
                            </div>
                            <div class="flex items-center gap-2 mt-2 justify-between">
                                <div 
                                    class="flex flex-row items-center gap-1"
                                    :class="{ 'text-green-50': isCompleted(habit.id), 
                                              'text-yellow-600': !isCompleted(habit.id) }"
                                >
                                    <Star :size="16" />
                                    <span class="text-sm">{{ habit.points }} points</span>
                                </div>
                                <div v-if="isParent" class="flex flex-row items-center gap-1">
                                    <Button icon="pi pi-history" variant="text" rounded @click="historyHabitDialog = true" />
                                    <Button icon="pi pi-pencil" variant="text" rounded @click="updateHabitDialog = true" />
                                    <Button icon="pi pi-trash" variant="text" rounded @click="remove(habit)" />

                                    <history-habit-dialog v-model="historyHabitDialog" :members="familyMembers" :habit="habit" />
                                    <update-habit-dialog v-model="updateHabitDialog" :members="familyMembers" :habit="habit" @updated="updateHabits" />
                                </div>  
                                <Button 
                                    v-else 
                                    :label="isCompleted(habit.id) ? ' Done' : 'Mark Done'" 
                                    variant="text"
                                    class="rounded-xl font-medium"
                                    :class="{
                                        'bg-white text-green-600 hover:bg-gray-100': isCompleted(habit.id),
                                        'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white': !isCompleted(habit.id)
                                    }"
                                    :disabled="isCompleted(habit.id)"
                                    :icon="isCompleted(habit.id) ? 'pi pi-check' : ''"
                                    @click="complete(habit)"
                                />
                            </div>
                        </div>
                    </div>
                </template>  
            </Card>
        </div>

        <Card v-else class="mt-8 text-center border-0 shadow-lg rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50">
            <template #content>
                <div class="text-6xl mb-4">🌱</div>
                <h3 class="text-xl font-bold text-gray-700 mb-2">No habits yet!</h3>
                <p class="text-gray-500">
                    {{ isParent ? 'Add your first habit to get started!' : 'Ask a parent to add some habits for you!' }}
                </p>
            </template>
        </Card>
    </div>
</template>