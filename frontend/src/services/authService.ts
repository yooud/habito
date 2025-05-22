import api from "@/api";
import type { 
    LoginResponse
 } from "@/types/auth";

export const login = async (): Promise<LoginResponse> => {
  const response = await api.post("/auth");
  return response.data;
};
