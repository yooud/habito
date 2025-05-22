import api from "@/api";
import type { 
  Habit,
  CreateHabitRequest,
  AssignHabitRequest,
  AssignHabitResponse,
  HabitResponse,
  UpdateAssignedHabitRequest,
  CompleteHabitResponse,
  HabitCompletionResponse
} from "@/types/habit";

export const getHabits = async (): Promise<Habit[]> => {
  const response = await api.get('/habits');
  return response.data;
};

export const getHabit = async (id: string): Promise<Habit> => {
  const response = await api.get(`/habits/${id}`);
  return response.data;
}

export const createHabit = async (data: CreateHabitRequest): Promise<Habit> => {
  const response = await api.post('/habits', data);
  return response.data;
}

export const updateHabit = async (id: string, data: Partial<CreateHabitRequest>): Promise<Habit> => {
  const response = await api.patch(`/habits/${id}`, data);
  return response.data;
}

export const removeHabit = async (id: string): Promise<void> => {
  await api.delete(`/habits/${id}`);
}

export const assignHabit = async (id: string, data: AssignHabitRequest): Promise<AssignHabitResponse> => {
  const response = await api.post(`/habits/${id}/assign`, data);
  return response.data;
}

export const getMyHabits = async (): Promise<HabitResponse> => {
  const response = await api.get('/habits/assigned/me');
  return response.data;
}

export const updateAssignedHabit = async (id: string, data: UpdateAssignedHabitRequest): Promise<void> => {
  const response = await api.patch(`/habits/assigned/${id}`, { params: data });
  return response.data;
}

export const removeAssignedHabit = async (id: string): Promise<void> => {
  await api.patch(`/habits/assigned/${id}`);
}

export const completeHabit = async (id: string): Promise<CompleteHabitResponse> => {
  const response = await api.post(`/habits/assigned/${id}`);
  return response.data;
}

export const getHabitCompletions = async (id: string): Promise<HabitCompletionResponse> => {
  const response = await api.post(`/habits/${id}/completions`);
  return response.data;
}
