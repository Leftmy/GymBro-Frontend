import type { Exercise, ExerciseFilters, MuscleGroup } from "@/app/shared/types/api";
import { request } from "@/app/shared/services/apiClient";
import { mockExercises, mockMuscles } from "@/app/shared/mocks/mockData";

// Re-export so consumers can import from the service
export type { ExerciseFilters };

const DIFFICULTY_BY_LEVEL: Record<number, string> = { 1: "Easy", 2: "Intermediate", 3: "Hard" };

export const iqService = {
  async getMuscles(): Promise<MuscleGroup[]> {
    return request<MuscleGroup[]>("/iq/muscles/", {
      mock: () => structuredClone(mockMuscles),
    });
  },

  async getExercises(filters: ExerciseFilters = {}): Promise<Exercise[]> {
    return request<Exercise[]>("/iq/exercises/", {
      query: filters as Record<string, string | number | boolean | undefined>,
      mock: () => {
        let list = structuredClone(mockExercises);
        if (filters.muscle) list = list.filter((e) => e.muscles.some((m) => m.slug === filters.muscle));
        if (filters.name) list = list.filter((e) => e.name.toLowerCase().includes(filters.name!.toLowerCase()));
        if (filters.id != null) list = list.filter((e) => e.id === filters.id);
        if (filters.difficulty != null) {
          const target = DIFFICULTY_BY_LEVEL[filters.difficulty];
          if (target) list = list.filter((e) => e.difficulty.toLowerCase() === target.toLowerCase());
        }
        return list;
      },
    });
  },
};