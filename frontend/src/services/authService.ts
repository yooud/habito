import api from "@/api";
import type { Error } from "@/types/api";
import type { 
    LoginResponse
 } from "@/types/auth";
import type {  } from 'axios';
import { AxiosError} from "axios";

export const login = async (): Promise<LoginResponse | Error> => {
  try {
    const response = await api.post("/auth");
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      return error.response?.data;
  }
};
