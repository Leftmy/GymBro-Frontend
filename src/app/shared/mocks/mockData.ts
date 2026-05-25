import type {
  Bro,
  Comment,
  Exercise,
  MuscleGroup,
  Post,
  User,
  UserWorkoutPlan,
  WorkoutPlan,
} from "@/app/shared/types/api";

export const mockUser: User = {
  id: 1,
  uuid: "11111111-1111-1111-1111-111111111111",
  username: "iron_alex",
  email: "alex@gymbro.app",
  role: "client",
  created_at: "2025-01-12T08:00:00Z",
};

export const mockMuscles: MuscleGroup[] = [
  { id: 1,  name: "Chest",      slug: "chest" },
  { id: 2,  name: "Back",       slug: "back" },
  { id: 3,  name: "Shoulders",  slug: "shoulders" },
  { id: 4,  name: "Biceps",     slug: "biceps" },
  { id: 5,  name: "Triceps",    slug: "triceps" },
  { id: 6,  name: "Abs",        slug: "abs" },
  { id: 7,  name: "Quads",      slug: "quadriceps" },
  { id: 8,  name: "Hamstrings", slug: "hamstrings" },
  { id: 9,  name: "Glutes",     slug: "glutes" },
  { id: 10, name: "Calves",     slug: "calves" },
  { id: 11, name: "Neck",       slug: "neck" },
];

const m = (slug: string) => mockMuscles.find((x) => x.slug === slug)!;

export const mockExercises: Exercise[] = [
  {
    id: 1,
    name: "Bench Press",
    description: "Flat barbell press",
    description_i18n: { en: "Flat barbell press", es: "Press de barra para pecho", uk: "Класична вправа для грудних м'язів." },
    difficulty: "Intermediate",
    muscles: [m("chest"), m("triceps")],
  },
  {
    id: 2,
    name: "Incline Dumbbell Press",
    description: "Upper chest focus",
    description_i18n: { en: "Upper chest focus", es: "Movimiento de empuje para la parte superior del pecho.", uk: "Жим гантелей під кутом для верхньої частини грудей." },
    difficulty: "Intermediate",
    muscles: [m("chest"), m("shoulders")],
  },
  {
    id: 3,
    name: "Pull Up",
    description: "Bodyweight back builder",
    description_i18n: { en: "Bodyweight vertical pulling exercise.", es: "Ejercicio de tracción vertical con el propio peso.", uk: "Вправа вертикального тягнення з власною вагою." },
    difficulty: "Hard",
    muscles: [m("back"), m("biceps")],
  },
  {
    id: 4,
    name: "Deadlift",
    description: "Posterior chain king",
    description_i18n: { en: "Posterior chain compound lift.", es: "Levantamiento compuesto de cadena posterior.", uk: "Комплексне підняття для задньої поверхні тіла." },
    difficulty: "Hard",
    muscles: [m("back"), m("hamstrings"), m("glutes")],
  },
  {
    id: 5,
    name: "Squat",
    description: "Legs foundation",
    description_i18n: { en: "Compound lower body movement.", es: "Movimiento compuesto de tren inferior.", uk: "Комплексна вправа для нижньої частини тіла." },
    difficulty: "Intermediate",
    muscles: [m("quadriceps"), m("glutes"), m("hamstrings")],
  },
  {
    id: 6,
    name: "Lunges",
    description: "Single leg strength",
    description_i18n: { en: "Unilateral lower-body exercise for balance and strength.", es: "Ejercicio unilateral para fuerza y equilibrio.", uk: "Одностороння вправа для ніг і балансу." },
    difficulty: "Easy",
    muscles: [m("quadriceps"), m("glutes")],
  },
  {
    id: 7,
    name: "Overhead Press",
    description: "Standing shoulder press",
    description_i18n: { en: "Standing shoulder press", es: "Press de hombros", uk: "Жим над головою" },
    difficulty: "Intermediate",
    muscles: [m("shoulders"), m("triceps")],
  },
  {
    id: 8,
    name: "Barbell Curl",
    description: "Classic bicep builder",
    description_i18n: { en: "Classic bicep builder", es: "Curl de bíceps", uk: "Ізолююча вправа для біцепса." },
    difficulty: "Easy",
    muscles: [m("biceps")],
  },
  {
    id: 9,
    name: "Tricep Dip",
    description: "Bodyweight triceps",
    description_i18n: { en: "Bodyweight triceps exercise", es: "Fondos de tríceps", uk: "Відтискання на брусах" },
    difficulty: "Intermediate",
    muscles: [m("triceps"), m("chest")],
  },
  {
    id: 10,
    name: "Plank",
    description: "Core stability",
    description_i18n: { en: "Core stabilization exercise.", es: "Ejercicio de estabilización del core.", uk: "Вправа для стабілізації корпусу." },
    difficulty: "Easy",
    muscles: [m("abs")],
  },
  {
    id: 11,
    name: "Calf Raise",
    description: "Standing calf work",
    description_i18n: { en: "Isolation movement for calves.", es: "Ejercicio de aislamiento para pantorrillas.", uk: "Ізолююча вправа для литок." },
    difficulty: "Easy",
    muscles: [m("calves")],
  },
  {
    id: 12,
    name: "Romanian Deadlift",
    description: "Hamstring isolation",
    description_i18n: { en: "Posterior chain focused hip hinge.", es: "Bisagra de cadera centrada en la cadena posterior.", uk: "Хіп-хіндж, що фокусується на задній поверхні тіла." },
    difficulty: "Intermediate",
    muscles: [m("hamstrings"), m("glutes")],
  },
  {
    id: 13,
    name: "Neck Extension",
    description: "Posterior neck strengthening",
    description_i18n: { en: "Posterior neck strengthening", es: "Fortalecimiento de la parte posterior del cuello.", uk: "Зміцнення задньої частини шиї." },
    difficulty: "Easy",
    muscles: [m("neck")],
  },
  {
    id: 14,
    name: "Neck Flexion",
    description: "Anterior neck isometric hold",
    description_i18n: { en: "Anterior neck isometric hold", es: "Sostén isométrico del cuello anterior.", uk: "Ізометричне утримання передньої частини шиї." },
    difficulty: "Easy",
    muscles: [m("neck")],
  },
  {
    id: 15,
    name: "Lateral Neck Stretch",
    description: "Side neck mobility and light work",
    description_i18n: { en: "Side neck mobility and light work", es: "Movilidad lateral del cuello y trabajo ligero.", uk: "Бічна мобільність шиї та легка робота." },
    difficulty: "Easy",
    muscles: [m("neck")],
  },
];

const exSlug = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

export const mockWorkoutPlans: WorkoutPlan[] = [
  {
    id: 1,
    name: "Push Day",
    description: "Chest, shoulders, triceps",
    is_public: true,
    exercises: [
      { exercise: mockExercises[0], sets: 4, reps: 8, rest_seconds: 90, order: 1 },
      { exercise: mockExercises[1], sets: 3, reps: 10, rest_seconds: 75, order: 2 },
      { exercise: mockExercises[6], sets: 3, reps: 8, rest_seconds: 90, order: 3 },
      { exercise: mockExercises[8], sets: 3, reps: 12, rest_seconds: 60, order: 4 },
    ],
  },
  {
    id: 2,
    name: "Pull Day",
    description: "Back and biceps",
    is_public: true,
    exercises: [
      { exercise: mockExercises[3], sets: 4, reps: 6, rest_seconds: 120, order: 1 },
      { exercise: mockExercises[2], sets: 4, reps: 8, rest_seconds: 90, order: 2 },
      { exercise: mockExercises[7], sets: 3, reps: 12, rest_seconds: 60, order: 3 },
    ],
  },
  {
    id: 3,
    name: "Leg Day",
    description: "Quadriceps, hamstrings, glutes",
    is_public: false,
    exercises: [
      { exercise: mockExercises[4], sets: 5, reps: 5, rest_seconds: 120, order: 1 },
      { exercise: mockExercises[11], sets: 4, reps: 10, rest_seconds: 90, order: 2 },
      { exercise: mockExercises[5], sets: 3, reps: 12, rest_seconds: 60, order: 3 },
      { exercise: mockExercises[10], sets: 4, reps: 15, rest_seconds: 45, order: 4 },
    ],
  },
  {
    id: 4,
    name: "Full Body",
    description: "Quick total workout",
    is_public: true,
    exercises: [
      { exercise: mockExercises[4], sets: 3, reps: 8, rest_seconds: 90, order: 1 },
      { exercise: mockExercises[0], sets: 3, reps: 8, rest_seconds: 90, order: 2 },
      { exercise: mockExercises[2], sets: 3, reps: 6, rest_seconds: 90, order: 3 },
      { exercise: mockExercises[9], sets: 3, reps: 30, rest_seconds: 30, order: 4 },
    ],
  },
];

export const mockUserWorkouts: UserWorkoutPlan[] = [
  { id: 101, day_of_week: 1, is_active: true, workout: mockWorkoutPlans[0] },
  { id: 102, day_of_week: 3, is_active: false, workout: mockWorkoutPlans[1] },
  { id: 103, day_of_week: 5, is_active: false, workout: mockWorkoutPlans[2] },
  { id: 104, day_of_week: null, is_active: false, workout: mockWorkoutPlans[3] },
];

export const mockPosts: Post[] = [
  {
    id: "aaaaaaaa-0000-0000-0000-000000000001",
    title: "5 Tips for Faster Recovery",
    body: "Sleep, protein, hydration, mobility work, and deload weeks are the foundation of consistent gains. Here is how to weave them into a busy schedule...",
    author: "coach_mike",
    status: "published",
    created_at: "2026-04-10T09:00:00Z",
    updated_at: "2026-04-10T09:00:00Z",
    published_at: "2026-04-10T09:00:00Z",
    comments_count: 4,
  },
  {
    id: "aaaaaaaa-0000-0000-0000-000000000002",
    title: "How to Structure a Push/Pull/Legs Split",
    body: "PPL is one of the most effective hypertrophy splits. Frequency, volume per muscle group, and recovery should drive your design choices.",
    author: "iron_alex",
    status: "published",
    created_at: "2026-04-15T11:00:00Z",
    updated_at: "2026-04-15T11:00:00Z",
    published_at: "2026-04-15T11:00:00Z",
    comments_count: 2,
  },
  {
    id: "aaaaaaaa-0000-0000-0000-000000000003",
    title: "Mind-Muscle Connection: Hype or Real?",
    body: "Research suggests focusing on the working muscle improves activation. But execution and progressive overload still rule.",
    author: "sara_lifts",
    status: "published",
    created_at: "2026-04-20T13:30:00Z",
    updated_at: "2026-04-20T13:30:00Z",
    published_at: "2026-04-20T13:30:00Z",
    comments_count: 1,
  },
];

export const mockComments: Comment[] = [
  { id: 1, post: mockPosts[0].id, body: "Sleep changed everything for me.", created_at: "2026-04-11T08:00:00Z", username: "coach_mike" },
  { id: 2, post: mockPosts[0].id, body: "Mobility is so underrated.", created_at: "2026-04-11T09:10:00Z", username: "sara_lifts" },
  { id: 3, post: mockPosts[0].id, body: "Deload weeks saved my elbows.", created_at: "2026-04-12T07:00:00Z", username: "iron_alex" },
  { id: 4, post: mockPosts[0].id, body: "Hydration is huge.", created_at: "2026-04-13T10:00:00Z", username: "guest42" },
  { id: 5, post: mockPosts[1].id, body: "PPL twice a week is my sweet spot.", created_at: "2026-04-15T15:00:00Z", username: "coach_mike" },
  { id: 6, post: mockPosts[1].id, body: "Great breakdown.", created_at: "2026-04-16T09:00:00Z", username: "sara_lifts" },
  { id: 7, post: mockPosts[2].id, body: "Execution > everything.", created_at: "2026-04-21T08:00:00Z", username: "iron_alex" },
];

export const exerciseSlug = exSlug;

export const mockUsers: User[] = [
  { id: 2,  uuid: "u-2",  username: "coach_mike",   email: "mike@gymbro.app",    role: "trainer", created_at: "2024-09-12T10:00:00Z" },
  { id: 3,  uuid: "u-3",  username: "sara_lifts",   email: "sara@gymbro.app",    role: "client",  created_at: "2025-02-01T12:00:00Z" },
  { id: 4,  uuid: "u-4",  username: "dan_quad",     email: "dan@gymbro.app",     role: "client",  created_at: "2025-06-20T09:00:00Z" },
  { id: 5,  uuid: "u-5",  username: "ada_zen",      email: "ada@gymbro.app",     role: "trainer", created_at: "2024-11-04T14:00:00Z" },
  { id: 6,  uuid: "u-6",  username: "zeus_lifts",   email: "zeus@gymbro.app",    role: "client",  created_at: "2025-03-10T08:00:00Z" },
  { id: 7,  uuid: "u-7",  username: "maria_fit",    email: "maria@gymbro.app",   role: "client",  created_at: "2025-04-22T11:00:00Z" },
  { id: 8,  uuid: "u-8",  username: "titan_rex",    email: "titan@gymbro.app",   role: "trainer", created_at: "2024-12-01T07:00:00Z" },
  { id: 9,  uuid: "u-9",  username: "flex_gordon",  email: "flex@gymbro.app",    role: "client",  created_at: "2025-01-30T16:00:00Z" },
  { id: 10, uuid: "u-10", username: "iron_queen",   email: "queen@gymbro.app",   role: "trainer", created_at: "2025-05-05T09:30:00Z" },
];

// Accepted bro relationships for the current user (mockUser id=1)
export const mockBros: Bro[] = [
  { id: 1, sender: mockUser, receiver: mockUsers[0], status: "accepted", created_at: "2025-10-01T09:00:00Z" },
  { id: 2, sender: mockUsers[1], receiver: mockUser, status: "accepted", created_at: "2025-10-05T14:00:00Z" },
  { id: 3, sender: mockUser, receiver: mockUsers[2], status: "accepted", created_at: "2025-11-10T11:00:00Z" },
];

// Incoming requests to the current user
export const mockIncomingBros: Bro[] = [
  { id: 4, sender: mockUsers[3], receiver: mockUser, status: "pending", created_at: "2026-01-15T08:00:00Z" },
  { id: 5, sender: mockUsers[4], receiver: mockUser, status: "pending", created_at: "2026-02-20T10:00:00Z" },
];

// Outgoing requests from the current user
export const mockOutgoingBros: Bro[] = [
  { id: 6, sender: mockUser, receiver: mockUsers[5], status: "pending", created_at: "2026-03-05T12:00:00Z" },
];
