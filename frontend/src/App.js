import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import LoginPage from "./pages/LoginPage";
import Inventory from "./components/Inventory";
import Characters from "./components/CharacterSelection";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";

// Initialize React Query's QueryClient
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-gray-900 text-white">
            <NavBar />
            <main className="flex-grow container mx-auto p-4">
              <AnimatedRoutes />
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <Home />
            </PageTransition>
          }
        />
        <Route
          path="/login"
          element={
            <PageTransition>
              <LoginPage />
            </PageTransition>
          }
        />
        <Route
          path="/inventory/:characterId"
          element={
            <PageTransition>
              <ProtectedRoute>
                <Inventory />
              </ProtectedRoute>
            </PageTransition>
          }
        />
        <Route
          path="/characters"
          element={
            <PageTransition>
              <ProtectedRoute>
                <Characters />
              </ProtectedRoute>
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}

function Home() {
  const { user } = useAuth();
  return (
    <div className="text-center">
      <h2 className="text-4xl font-bold mb-8 text-center">Welcome to TTRPG Tools</h2>
      {user ? (
        <p className="mt-4 text-gray-400">You're logged in as {user.email}.</p>
      ) : (
        <p className="mt-4 text-gray-400">Please log in to access tools.</p>
      )}
    </div>
  );
}

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Show a loading spinner while the auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  // Redirect to login page if not logged in
  if (!user) {
    return <Navigate to="/login" state={{ message: "Please log in to access this page." }} />;
  }

  return children;
};

export default App;
