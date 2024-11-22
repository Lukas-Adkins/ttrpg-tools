import React, { useState, useEffect } from "react";

const Login = ({ onSignIn, onSignUp, flashMessage, error }) => {
  const [email, setEmail] = useState(""); // Email input state
  const [password, setPassword] = useState(""); // Password input state
  const [rememberMe, setRememberMe] = useState(false); // "Remember Me" checkbox state

  const [fadeOutFlash, setFadeOutFlash] = useState(false); // For fading out flash messages
  const [fadeOutError, setFadeOutError] = useState(false); // For fading out error messages

  // Load saved email from localStorage when the component mounts
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Handle fading out the flash message
  useEffect(() => {
    if (flashMessage) {
      const timer = setTimeout(() => setFadeOutFlash(true), 4000); // Start fade-out after 4 seconds
      const clearTimer = setTimeout(() => {
        setFadeOutFlash(false); // Reset fade-out state
      }, 5000); // Remove flash message after fade-out completes

      return () => {
        clearTimeout(timer);
        clearTimeout(clearTimer);
      };
    }
  }, [flashMessage]);

  // Handle fading out the error message
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setFadeOutError(true), 4000); // Start fade-out after 4 seconds
      const clearTimer = setTimeout(() => {
        setFadeOutError(false); // Reset fade-out state
      }, 5000); // Remove error message after fade-out completes

      return () => {
        clearTimeout(timer);
        clearTimeout(clearTimer);
      };
    }
  }, [error]);

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSignIn();
    }
  };

  const handleSignIn = () => {
    if (rememberMe) {
      localStorage.setItem("rememberedEmail", email); // Save email to localStorage
    } else {
      localStorage.removeItem("rememberedEmail"); // Remove email if "Remember Me" is unchecked
    }
    onSignIn(email, password);
  };

  const handleSignUp = () => {
    onSignUp(email, password);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-900"
      onKeyPress={handleKeyPress} // Listen for keypress
    >
      <div className="w-full max-w-md p-8 space-y-4 bg-gray-800 rounded-lg shadow-lg">
        {/* Message Container with Fixed Height */}
        <div className="h-12">
          {/* Flash Message */}
          {flashMessage && (
            <div
              className={`bg-red-500 text-white text-center py-2 rounded-md transition-opacity duration-500 ${
                fadeOutFlash ? "opacity-0" : "opacity-100"
              }`}
            >
              {flashMessage}
            </div>
          )}
          {/* Error Message */}
          {error && (
            <div
              className={`bg-red-600 text-white text-center py-2 rounded-md transition-opacity duration-500 ${
                fadeOutError ? "opacity-0" : "opacity-100"
              }`}
            >
              {error}
            </div>
          )}
        </div>

        <h2 className="text-3xl font-bold text-center text-white">TTRPG Tools Login</h2>
        <p className="text-center text-gray-400">Enter your credentials to continue</p>
        <div>
          <label className="block text-sm font-medium text-gray-300">Email</label>
          <input
            type="email"
            className="w-full px-4 py-2 mt-2 text-gray-900 bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 mt-2 text-gray-900 bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex items-center mt-4">
          <input
            type="checkbox"
            id="rememberMe"
            className="mr-2"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label htmlFor="rememberMe" className="text-gray-300 text-sm">
            Remember Me
          </label>
        </div>

        <button
          onClick={handleSignIn}
          className="w-full px-4 py-2 mt-4 text-white bg-blue-600 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-700"
        >
          Sign In
        </button>
        <button
          onClick={handleSignUp}
          className="w-full px-4 py-2 mt-2 text-blue-600 bg-white rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-700"
        >
          Sign Up
        </button>
        <p className="text-center text-gray-400 text-sm">
          Don't have an account? <span className="text-blue-400 cursor-pointer">Sign up</span>
        </p>

        {/* Bottom Padding to Match Message Container */}
        <div className="h-12"></div>
      </div>
    </div>
  );
};

export default Login;
