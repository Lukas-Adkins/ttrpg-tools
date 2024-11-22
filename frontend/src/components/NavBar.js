import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase/firebase";
import { signOut } from "firebase/auth"; // Import signOut function
import { HomeIcon } from "@heroicons/react/solid"; // Example: Heroicons for Home Icon (requires `@heroicons/react`)

const NavBar = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null); // Clear the user state
  
      // Delay navigation to allow the animation to complete
      setTimeout(() => {
        navigate("/login"); // Redirect to the login page
      }, 300); // Match the Framer Motion exit animation duration
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  };

  // Helper function to check if a link is active
  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-gray-800 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Left Side: Home Icon + Feature Links */}
        <div className="flex items-center space-x-6">
          {/* Home Icon */}
          <Link to="/" className="text-gray-300 hover:text-blue-500 transition">
            <HomeIcon className="h-8 w-8" />
          </Link>

          {/* Character Tracker Link (Visible to All Users) */}
          <Link
            to="/characters"
            className={`text-lg font-semibold px-4 py-2 rounded-lg transition ${
              isActive("/characters")
                ? "bg-blue-600 text-white shadow-lg"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            Characters
          </Link>
        </div>

        {/* Right Side: Login/Logout Button */}
        <div>
          {user ? (
            <button
              onClick={handleLogout}
              className="bg-red-600 px-4 py-2 rounded-md hover:bg-red-500 text-white transition"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className={`bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-500 transition ${
                isActive("/login") ? "text-white font-bold" : "text-white"
              }`}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;
