import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import "@/app/shared/i18n";
import { AuthProvider } from "@/app/features/auth/context/AuthContext";
import { AppLayout } from "@/app/shared/components/layout/AppLayout";
import { RequireAuth } from "@/app/features/auth/components/RequireAuth";
import { GuestGate } from "@/app/shared/components/common/GuestGate";
import { HomePage } from "@/app/pages/HomePage";
import { LoginPage } from "@/app/features/auth/pages/LoginPage";
import { RegisterPage } from "@/app/features/auth/pages/RegisterPage";
import { ProfilePage } from "@/app/features/user/pages/ProfilePage";
import { IQPage } from "@/app/features/iq/pages/IQPage";
import { MusclesPage } from "@/app/features/iq/pages/MusclesPage";
import { ExercisesPage } from "@/app/features/iq/pages/ExercisesPage";
import { GymPage } from "@/app/features/gym/pages/GymPage";
import { MyWorkoutsPage } from "@/app/features/gym/pages/MyWorkoutsPage";
import { CreateWorkoutPage } from "@/app/features/gym/pages/CreateWorkoutPage";
import { AssignWorkoutPage } from "@/app/features/gym/pages/AssignWorkoutPage";
import { SessionPage } from "@/app/features/gym/pages/SessionPage";
import { BrosPage } from "@/app/features/bros/pages/BrosPage";
import { MyBrosPage } from "@/app/features/bros/pages/MyBrosPage";
import { IncomingRequestsPage } from "@/app/features/bros/pages/IncomingRequestsPage";
import { OutgoingRequestsPage } from "@/app/features/bros/pages/OutgoingRequestsPage";
import { BlogPage } from "@/app/features/blog/pages/BlogPage";
import { PostDetailPage } from "@/app/features/blog/pages/PostDetailPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />

            <Route path="profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />

            <Route path="iq" element={<IQPage />}>
              <Route index element={<Navigate to="muscles" replace />} />
              <Route path="muscles" element={<MusclesPage />} />
              <Route path="exercises" element={<ExercisesPage />} />
            </Route>

            <Route path="gym" element={<GymPage />}>
              <Route index element={<Navigate to="workouts" replace />} />
              <Route path="workouts" element={<GuestGate><MyWorkoutsPage /></GuestGate>} />
              <Route path="create" element={<RequireAuth><CreateWorkoutPage /></RequireAuth>} />
              <Route path="assign" element={<RequireAuth><AssignWorkoutPage /></RequireAuth>} />
              <Route path="session" element={<RequireAuth><SessionPage /></RequireAuth>} />
            </Route>

            <Route path="bros" element={<GuestGate><BrosPage /></GuestGate>}>
              <Route index element={<Navigate to="my" replace />} />
              <Route path="my" element={<MyBrosPage />} />
              <Route path="incoming" element={<IncomingRequestsPage />} />
              <Route path="outgoing" element={<OutgoingRequestsPage />} />
            </Route>

            <Route path="blog" element={<GuestGate><BlogPage /></GuestGate>} />
            <Route path="blog/:id" element={<PostDetailPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
