export interface User {
  _id: string;
  uid: string;
  familyId: string | null;
  email: string;
  role: string | null;
  name: string;
  points: number;
}

export interface LoginResponse {
  user: User;
}