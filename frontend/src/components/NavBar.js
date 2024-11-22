import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NavBar = () => {
  const { user, logout } = useAuth(); // Access user state and logout function from AuthContext
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(navigate); // Use the updated logout function that includes delayed navigation
  };

  return (
    <header className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          <Link to="/">TTRPG Tools</Link>
        </h1>
        <nav>
          <ul className="flex space-x-4 items-center">
            <li>
              <Link to="/inventory" className="hover:text-blue-400 transition">
                Inventory Tracker
              </Link>
            </li>
            {user ? (
              <>
                <li className="text-gray-300">Welcome, {user.email}</li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 px-4 py-2 rounded-md hover:bg-red-500 transition"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link
                  to="/login"
                  className="bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-500 transition"
                >
                  Login
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default NavBar;
