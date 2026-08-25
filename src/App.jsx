import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CoursePage from "./pages/CoursePage";
import TaskPage from "./pages/TaskPage";

function BackgroundFX() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern [background-size:44px_44px]" />
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary-600/25 blur-3xl animate-float" />
      <div className="absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-accent-600/20 blur-3xl animate-float-slow" />
      <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-sky-600/15 blur-3xl animate-float" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface-950/80" />
    </div>
  );
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-surface-700 border-t-primary-400"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col">
      <BackgroundFX />
      <Navbar />
      <main className="flex-1 w-full container mx-auto px-4 py-6 sm:py-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/courses/:id"
            element={
              <PrivateRoute>
                <CoursePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/tasks/:id"
            element={
              <PrivateRoute>
                <TaskPage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
