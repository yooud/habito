export interface Reward {
    _id: string;
    title: string;
    description: string;
    pointsRequired: number;
}

export interface CreateRewardRequest {
    title: string;
    description: string;
    pointsRequired: number;
}

export interface RedeemedReward {
    user: {
        id: string;
        uid: string;
        email: string;
        name: string;
        role: string;
    },
    reward: {
        id: string;
        title: string;
        description: string;
        pointsRequired: number;
        redeemedAt: string;
    }
}