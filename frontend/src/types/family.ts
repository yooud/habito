export interface Family {
  _id: string;
  name: string;
}

export interface FamilyMember {
  id: string;
  uid: string;
  email: string;
  name: string;
  role: string;
  points: number;
}

export interface FamilyResponse {
  family: Family;
  members: FamilyMember[];
}

export interface CreateFamilyRequest {
  name: string;
}

export const enum FamilyRole {
  PARENT = "parent",
  CHILD = "child",
}

export interface AddFamilyMemberRequest {
  email: string;
  role: FamilyRole;
}

export interface UpdateFamilyMemberRequest {
  name: string;
  role: FamilyRole;
}