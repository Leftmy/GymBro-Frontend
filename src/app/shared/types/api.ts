// Strict types matching GymBro OpenAPI 3.0 spec

export type Role = "client" | "trainer" | "admin";
export type Status = "draft" | "published" | "archived";
export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type BroStatus = "pending" | "accepted" | "declined";

export interface User {
  id: number;
  uuid: string;
  username: string;
  email: string;
  role: Role;
  created_at: string;
}

export interface MuscleGroup {
  id: number;
  name: string;
  slug: string;
}

export interface Exercise {
  id: number;
  name: string;
  description?: string;
  difficulty: string;
  muscles: MuscleGroup[];
}

export interface WorkoutPlanExercise {
  exercise: Exercise;
  sets: number;
  reps: number;
  rest_seconds?: number;
  order: number;
}

export interface WorkoutPlan {
  id: number;
  name: string;
  description?: string;
  is_public?: boolean;
  exercises: WorkoutPlanExercise[];
}

export interface UserWorkoutPlan {
  id: number;
  day_of_week: DayOfWeek | null;
  is_active?: boolean;
  workout: WorkoutPlan;
}

export interface Comment {
  id: number;
  post: string;
  body: string;
  created_at: string;
  username: string;
}

export interface Post {
  id: string;
  title: string;
  body: string;
  author: string;
  status?: Status;
  labels?: unknown;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
  comments_count: number;
}

export interface WorkoutExerciseMap {
  slug: string;
  sets: number;
  reps: number;
  rest_seconds?: number;
  order: number;
}

export interface WorkoutCreate {
  name: string;
  description?: string;
  is_public?: boolean;
  exercises: WorkoutExerciseMap[];
}

export interface Bro {
  id: number;
  sender: User;
  receiver: User;
  status: BroStatus;
  created_at: string;
}

export interface PostCreatePayload {
  title: string;
  body: string;
  labels?: unknown;
  status?: Status;
}

export interface AuthTokens {
  access: string;
  refresh?: string;
}

export type DayParam =
  | "all"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

/** Query params for GET /iq/exercises/ — matches OpenAPI spec exactly */
export interface ExerciseFilters {
  muscle?: string;
  difficulty?: number;
  equipment?: string;
  name?: string;
  id?: number;
  primary?: boolean;
}