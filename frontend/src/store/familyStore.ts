import { defineStore } from "pinia";
import { reactive, computed } from "vue";
import {
  getFamily as fetchFamilyFromApi,
  createFamily as createFamilyApi,
  addFamilyMember as addFamilyMemberApi,
} from "@/services/familyService";
import type {
  Family,
  FamilyMember,
  FamilyResponse,
  CreateFamilyRequest,
  AddFamilyMemberRequest,
} from "@/types/family";

export const useFamilyStore = defineStore("familyStore", () => {
  const state = reactive<{
    family: Family | null;
    members: FamilyMember[];
    isLoadingFamily: boolean;
    isCreatingFamily: boolean;
    isAddingMember: boolean;
    pendingFetch: Promise<FamilyResponse> | null;
    pendingCreate: Promise<Family> | null;
    pendingAddMember: Promise<FamilyMember> | null;
  }>({
    family: null,
    members: [],
    isLoadingFamily: false,
    isCreatingFamily: false,
    isAddingMember: false,
    pendingFetch: null,
    pendingCreate: null,
    pendingAddMember: null,
  });

  const fetchFamily = async (forceRefresh = false): Promise<FamilyResponse> => {
    if (!forceRefresh && state.family !== null && state.members.length > 0) {
      return {
        family: state.family,
        members: state.members,
      };
    }

    if (!forceRefresh && state.pendingFetch) {
      return state.pendingFetch;
    }

    try {
      state.isLoadingFamily = true;
      const request = fetchFamilyFromApi();
      state.pendingFetch = request;

      const response = await request;
      if ('error' in response){
        state.family = null;
        state.members = [];
        return null
      } else {
        state.family = response.family;
        state.members = response.members;
        return response;
    }
    } catch (err) {
      console.error("Ошибка при загрузке семьи:", err);
      throw err;
    } finally {
      state.isLoadingFamily = false;
      state.pendingFetch = null;
    }
  };

  const createFamily = async (
    payload: CreateFamilyRequest
  ): Promise<Family> => {
    if (state.isCreatingFamily) {
      return state.pendingCreate!;
    }

    try {
      state.isCreatingFamily = true;
      const request = createFamilyApi(payload);
      state.pendingCreate = request;

      const newFamily = await request;
      state.family = newFamily;
      state.members = [];
      return newFamily;
    } catch (err) {
      console.error("Ошибка при создании семьи:", err);
      throw err;
    } finally {
      state.isCreatingFamily = false;
      state.pendingCreate = null;
    }
  };

  const addFamilyMember = async (
    payload: AddFamilyMemberRequest
  ): Promise<FamilyMember> => {
    if (state.isAddingMember) {
      return state.pendingAddMember!;
    }

    try {
      state.isAddingMember = true;
      const request = addFamilyMemberApi(payload);
      state.pendingAddMember = request;

      const newMember = await request;
      state.members.push(newMember);
      return newMember;
    } catch (err) {
      console.error("Ошибка при добавлении участника семьи:", err);
      throw err;
    } finally {
      state.isAddingMember = false;
      state.pendingAddMember = null;
    }
  };

  const clearFamily = () => {
    state.family = null;
    state.members = [];
  };

  return {
    family: computed(() => state.family),
    members: computed(() => state.members),
    isLoadingFamily: computed(() => state.isLoadingFamily),
    isCreatingFamily: computed(() => state.isCreatingFamily),
    isAddingMember: computed(() => state.isAddingMember),

    fetchFamily,
    createFamily,
    addFamilyMember,
    clearFamily,
  };
});
