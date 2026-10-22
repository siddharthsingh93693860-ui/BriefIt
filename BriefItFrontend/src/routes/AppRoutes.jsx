import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ProblemFeed from "../pages/ProblemFeed";
import useAuthStore from "../store/authStore";
import UniversityDashboard from "../pages/UniversityDashboard";
import IndustryDashboard from "../pages/IndustryDashboard";
import SubmittedProblem from "../pages/SubmittedProblem";
import IndustrySolutions from "../pages/IndustrySolutions";
import UserSolution from "../pages/UserSolution";
function AppRoutes() {
  const user = useAuthStore((state) => state.user);

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />

      <Route
        path="/"
        element={user ? <ProblemFeed /> : <Navigate to="/login" />}
      />
      <Route path="/user/solutions" element={<UserSolution />} />
      <Route path="/feed" element={<ProblemFeed />} />
      <Route path="/university" element={<UniversityDashboard />} />
      <Route path="/industry" element={<IndustryDashboard />} />
      <Route path="/submitted" element={<SubmittedProblem />} />
      <Route path="/industry/solutions" element={<IndustrySolutions />} />
    </Routes>
  );
}

export default AppRoutes;
