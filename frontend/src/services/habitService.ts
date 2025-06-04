import api from "@/api";
import type { Error } from "@/types/api";
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
import { AxiosError} from "axios";

export const getHabits = async (): Promise<Habit[] | Error> => {
  try {
    const response = await api.get('/habits');
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      return error.response?.data;
  }
};

export const getHabit = async (id: string): Promise<Habit | Error> => {
  try {
    const response = await api.get(`/habits/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      return error.response?.data;
  }
}

export const createHabit = async (data: CreateHabitRequest): Promise<Habit | Error> => {
  try {
    const response = await api.post('/habits', data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      return error.response?.data;
  }
}

export const updateHabit = async (id: string, data: Partial<CreateHabitRequest>): Promise<Habit | Error> => { 
  try {
    const response = await api.patch(`/habits/${id}`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      return error.response?.data;
  }
}

export const removeHabit = async (id: string): Promise<void | Error> => {
  try {
    await api.delete(`/habits/${id}`);
  } catch (error) {
    if (error instanceof AxiosError)
      return error.response?.data;
  }
}

export const assignHabit = async (id: string, data: AssignHabitRequest): Promise<AssignHabitResponse | Error> => {
    try {
    const response = await api.post(`/habits/${id}/assign`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      return error.response?.data;
  }
}

export const getMyHabits = async (): Promise<HabitResponse[]> => {
  try {
    const response = await api.get('/habits/assigned/me');
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      return error.response?.data;
  }
}

export const updateAssignedHabit = async (id: string, data: UpdateAssignedHabitRequest): Promise<void | Error> => {
  try {
    const response = await api.patch(`/habits/assigned/${id}`, { params: data });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      return error.response?.data;
  }
}

export const removeAssignedHabit = async (id: string): Promise<void | Error> => {
  try {
    await api.patch(`/habits/assigned/${id}`);
  } catch (error) {
    if (error instanceof AxiosError)
      return error.response?.data;
  }
}

export const completeHabit = async (id: string): Promise<CompleteHabitResponse | Error> => {
  try {
    const response = await api.post(`/habits/${id}/complete`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      return error.response?.data;
  }
}

export const getHabitCompletions = async (id: string): Promise<HabitCompletionResponse[] | Error> => {
  try {
    const response = await api.get(`/habits/${id}/completions`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      return error.response?.data;
  }
}
