import type {
  DayParam,
  UserWorkoutPlan,
  WorkoutCreate,
  WorkoutPlan,
} from "@/app/shared/types/api";
import { request } from "@/app/shared/services/apiClient";
import { exerciseSlug, mockExercises, mockUserWorkouts, mockWorkoutPlans } from "@/app/shared/mocks/mockData";

export interface AssignUserWorkoutPayload {
  workout_plan_id: number;
  day_of_week?: number | null;
  is_active?: boolean;
}

export interface UpdateUserWorkoutPayload {
  day_of_week?: number | null;
  is_active?: boolean;
}

export interface UpdateWorkoutPayload {
  name?: string;
  description?: string;
  is_public?: boolean;
}

const DAY_TO_NUM: Record<Exclude<DayParam, "all">, number> = {
  monday: 1, tuesday: 2, wednesday: 3, thursday: 4,
  friday: 5, saturday: 6, sunday: 7,
};

// Mock in-memory stores
let workoutPlans: WorkoutPlan[] = structuredClone(mockWorkoutPlans);
let userWorkouts: UserWorkoutPlan[] = structuredClone(mockUserWorkouts);
let nextWorkoutId = 1000;
let nextUserWorkoutId = 2000;

// Enforce: at most one is_active=true UserWorkoutPlan at any time.
function enforceSingleActive(activeId: number | null) {
  if (activeId == null) return;
  userWorkouts = userWorkouts.map((w) =>
    w.id === activeId ? { ...w, is_active: true } : { ...w, is_active: false }
  );
}

export const gymService = {
  // ------- Workout templates -------
  async getWorkouts(day?: DayParam): Promise<UserWorkoutPlan[]> {
    return request<UserWorkoutPlan[]>("/gym/workouts/", {
      query: { day },
      mock: () => {
        if (!day || day === "all") return structuredClone(userWorkouts);
        const num = DAY_TO_NUM[day];
        return structuredClone(userWorkouts.filter((w) => w.day_of_week === num));
      },
    });
  },

  async getWorkoutById(id: number): Promise<WorkoutPlan> {
    return request<WorkoutPlan>(`/gym/workouts/${id}/`, {
      mock: () => {
        const wp = workoutPlans.find((w) => w.id === id);
        if (!wp) throw new Error("Workout not found");
        return structuredClone(wp);
      },
    });
  },

  async createWorkout(payload: WorkoutCreate): Promise<WorkoutPlan> {
    return request<WorkoutPlan>("/gym/workouts/", {
      method: "POST",
      body: payload,
      mock: () => {
        const exercises = payload.exercises.map((e) => {
          const ex = mockExercises.find((m) => exerciseSlug(m.name) === e.slug) ?? mockExercises[0];
          return {
            exercise: ex,
            sets: e.sets,
            reps: e.reps,
            rest_seconds: e.rest_seconds ?? 60,
            order: e.order,
          };
        });
        const created: WorkoutPlan = {
          id: nextWorkoutId++,
          name: payload.name,
          description: payload.description,
          is_public: payload.is_public ?? false,
          exercises,
        };
        workoutPlans = [...workoutPlans, created];
        return structuredClone(created);
      },
    });
  },

  async updateWorkout(id: number, patch: UpdateWorkoutPayload): Promise<WorkoutPlan> {
    return request<WorkoutPlan>(`/gym/workouts/${id}/`, {
      method: "PATCH",
      body: patch,
      mock: () => {
        workoutPlans = workoutPlans.map((w) => (w.id === id ? { ...w, ...patch } : w));
        const updated = workoutPlans.find((w) => w.id === id);
        if (!updated) throw new Error("Workout not found");
        return structuredClone(updated);
      },
    });
  },

  async deleteWorkout(id: number): Promise<void> {
    return request<void>(`/gym/workouts/${id}/`, {
      method: "DELETE",
      mock: () => {
        workoutPlans = workoutPlans.filter((w) => w.id !== id);
        userWorkouts = userWorkouts.filter((w) => w.workout.id !== id);
        return undefined as unknown as void;
      },
    });
  },

  // ------- User workouts (assignments) -------
  async assignWorkoutToUser(payload: AssignUserWorkoutPayload): Promise<UserWorkoutPlan> {
    return request<UserWorkoutPlan>("/gym/user-workouts/", {
      method: "POST",
      body: payload,
      mock: () => {
        const wp = workoutPlans.find((w) => w.id === payload.workout_plan_id);
        if (!wp) throw new Error("Workout not found");
        const isActive = payload.is_active ?? true;
        const created: UserWorkoutPlan = {
          id: nextUserWorkoutId++,
          day_of_week: (payload.day_of_week ?? null) as UserWorkoutPlan["day_of_week"],
          is_active: isActive,
          workout: structuredClone(wp),
        };
        userWorkouts = [...userWorkouts, created];
        if (isActive) enforceSingleActive(created.id);
        return structuredClone(created);
      },
    });
  },

  async updateUserWorkout(id: number, patch: UpdateUserWorkoutPayload): Promise<UserWorkoutPlan> {
    return request<UserWorkoutPlan>(`/gym/user-workouts/${id}/`, {
      method: "PATCH",
      body: patch,
      mock: () => {
        userWorkouts = userWorkouts.map((w) =>
          w.id === id
            ? {
                ...w,
                day_of_week: (patch.day_of_week !== undefined
                  ? (patch.day_of_week as UserWorkoutPlan["day_of_week"])
                  : w.day_of_week),
                is_active: patch.is_active !== undefined ? patch.is_active : w.is_active,
              }
            : w
        );
        if (patch.is_active === true) enforceSingleActive(id);
        const updated = userWorkouts.find((w) => w.id === id);
        if (!updated) throw new Error("UserWorkoutPlan not found");
        return structuredClone(updated);
      },
    });
  },

  async deleteUserWorkout(id: number): Promise<void> {
    return request<void>(`/gym/user-workouts/${id}/`, {
      method: "DELETE",
      mock: () => {
        userWorkouts = userWorkouts.filter((w) => w.id !== id);
        return undefined as unknown as void;
      },
    });
  },

  // Convenience for forms that need the catalog of templates.
  async listWorkoutPlans(): Promise<WorkoutPlan[]> {
    const data = await request<UserWorkoutPlan[]>("/gym/workouts/", {
    mock: () =>
      structuredClone(
        userWorkouts.map((uw) => ({
          ...uw,
          workout: structuredClone(
            workoutPlans.find((w) => w.id === uw.workout.id)
          ),
        }))
      ),
  });

  return data.map((item) => item.workout);
  },
};
