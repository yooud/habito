import api from "@/api";
import type { Error } from "@/types/api";
import type { 
    Reward,
    CreateRewardRequest,
    RedeemedReward
 } from "@/types/rewards";
import { AxiosError} from "axios";

export const getRewards = async (): Promise<Reward[] | Error> => {
  try {
    const response = await api.get("/rewards");
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      return error.response?.data;
  }
};

export const createReward = async (data: CreateRewardRequest): Promise<Reward | Error> => {
  try {
    const response = await api.post("/rewards", data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      return error.response?.data;
  }
};

export const redeemReward = async (rewardId: string): Promise<RedeemedReward | Error> => {
  try {
    const response = await api.post(`/rewards/${rewardId}/redeem`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      return error.response?.data;
  }
}

export const getRedeemedRewards = async (): Promise<RedeemedReward[] | Error> => {
  try {
    const response = await api.get("/rewards/redeemed");
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      return error.response?.data;
  }
};

export const updateReward = async (id: string, data: CreateRewardRequest): Promise<void | Error> => {
  try {
    const response = await api.patch(`/rewards/${id}`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      return error.response?.data;
  }
};

export const removeReward = async (id: string): Promise<void | Error> => {
  try {
    const response = await api.delete(`/rewards/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      return error.response?.data;
  }
};