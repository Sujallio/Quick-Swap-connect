import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import AppHeader from "@/components/AppHeader";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import CreateRequestPage from "@/pages/CreateRequestPage";
import MyRequestsPage from "@/pages/MyRequestsPage";
import ProfilePage from "@/pages/ProfilePage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  }

  return (
    <>
      {user && <AppHeader />}
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/post" element={<ProtectedRoute><CreateRequestPage /></ProtectedRoute>} />
        <Route path="/my-requests" element={<ProtectedRoute><MyRequestsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {user && <BottomNav />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="mx-auto max-w-lg min-h-screen">
            <AppRoutes />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
