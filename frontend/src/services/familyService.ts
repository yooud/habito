import api from "@/api";
import type { 
    FamilyResponse,
    CreateFamilyRequest,
    AddFamilyMemberRequest
 } from "@/types/family";

export const getFamily = async (): Promise<FamilyResponse> => {
  const response = await api.get("/family");
  return response.data;
};

export const createFamily = async (data: CreateFamilyRequest): Promise<FamilyResponse> => {
  const response = await api.post("/family", data);
  return response.data;
}

export const addFamilyMember = async (data: AddFamilyMemberRequest): Promise<FamilyResponse> => {
  const response = await api.post("/family/members", data);
  return response.data;
}

export const removeFamily = async (): Promise<void> => {
  await api.delete("/family");
}
