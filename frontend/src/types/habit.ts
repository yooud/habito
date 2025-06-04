export const enum SCHEDULE_DAYS {
  MON = 'Mon',
  TUE = 'Tue',
  WED = 'Wed',
  THU = 'Thu',
  FRI = 'Fri',
  SAT = 'Sat',
  SUN = 'Sun',
}

export interface CreateHabitRequest {
	title: string;
	description: string;
	points: number;
	schedule: SCHEDULE_DAYS[];
	emoji: string;
}

export interface Habit {
	_id?: string;
	id?: string;
	title: string;
	description: string;
	points: number;
	createdBy: string;
	schedule: SCHEDULE_DAYS[];
	emoji: string;
	assignedTo: {
		uid: string;
		name: string;
		isActive: boolean;
	}[]
}

export interface AssignHabitRequest {
	childId: string;
	isActive: boolean;
}

export interface AssignHabitResponse {
	message: string;
	assignment: {
		_id: string;
		userId: string;
		habitId: string;
		isActive: boolean;
		assignedAt: Date;
	}
}

export interface HabitResponse {
	id: string;
  isActive: boolean;
  habit: Habit;
}

export interface UpdateAssignedHabitRequest {
  isActive: boolean;
}

export interface CompleteHabitResponse {
  message: string;
  pointsEarned: number;
  totalPoints: number;
  completion: {
    userHabitId: string;
    completedAt: Date;
  }
}

export interface HabitCompletionResponse {
  _id: string;
  userHabitId: string;
  completedAt: string;
  user: {
	id: string;
  }
}