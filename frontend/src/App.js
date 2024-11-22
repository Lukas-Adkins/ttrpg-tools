import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import LoginPage from "./pages/LoginPage";
import Inventory from "./components/Inventory";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";

function App() {
  return (
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
          path="/inventory"
          element={
            <PageTransition>
              <ProtectedRoute>
                <Inventory />
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
      <h2 className="text-3xl font-bold">Welcome to TTRPG Tools</h2>
      {user ? (
        <p className="mt-4 text-gray-400">You're logged in as {user.email}.</p>
      ) : (
        <p className="mt-4 text-gray-400">Please log in to access tools.</p>
      )}
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" state={{ message: "Please log in to access this page." }} />;
  }

  return children;
}

export default App;
