import api from "@/api";
import type { Error } from "@/types/api";
import type { 
    FamilyResponse,
    CreateFamilyRequest,
    AddFamilyMemberRequest
 } from "@/types/family";
import { AxiosError} from "axios";

export const getFamily = async (): Promise<FamilyResponse | Error> => {
  try {
    const response = await api.get("/family");
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      return error.response?.data;
  }
};

export const createFamily = async (data: CreateFamilyRequest): Promise<FamilyResponse | Error> => {
  try {
    const response = await api.post("/family", data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      return error.response?.data;
  }
}

export const addFamilyMember = async (data: AddFamilyMemberRequest): Promise<FamilyResponse | Error> => {
  try {
    const response = await api.post("/family/members", data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      return error.response?.data;
  }
}

export const removeFamily = async (): Promise<void | Error> => {
  try {
    await api.delete("/family");
  } catch (error) {
    if (error instanceof AxiosError)
      return error.response?.data;
  }
}
