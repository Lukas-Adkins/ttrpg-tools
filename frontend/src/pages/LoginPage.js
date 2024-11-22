import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";
import Login from "../components/Login";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const [flashMessage, setFlashMessage] = useState("");
  const [fadeOut, setFadeOut] = useState(false); // Track fade-out state for flash messages
  const [error, setError] = useState(""); // Track error messages
  const [errorFadeOut, setErrorFadeOut] = useState(false); // Track fade-out state for error messages

  useEffect(() => {
    if (location.state?.message) {
      setFlashMessage(location.state.message);

      // Start fade-out effect for flash messages
      const timer = setTimeout(() => setFadeOut(true), 4000); // Trigger fade-out after 4 seconds
      const clearTimer = setTimeout(() => {
        setFlashMessage("");
        setFadeOut(false); // Reset fade-out state
      }, 5000); // Remove message after fade-out completes

      return () => {
        clearTimeout(timer);
        clearTimeout(clearTimer);
      };
    }
  }, [location.state]);

  const handleSignIn = async (email, password) => {
    setError(""); // Clear previous errors
    setErrorFadeOut(false);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      navigate("/");
    } catch (error) {
      handleFirebaseError(error, "login"); // Handle Firebase login errors
    }
  };

  const handleSignUp = async (email, password) => {
    setError(""); // Clear previous errors
    setErrorFadeOut(false);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      navigate("/");
    } catch (error) {
      handleFirebaseError(error, "signup"); // Handle Firebase signup errors
    }
  };

  const handleFirebaseError = (error, type) => {
    if (error.code === "auth/wrong-password") {
      setError("Invalid password. Please try again.");
    } else if (error.code === "auth/user-not-found") {
      setError("No user found with this email.");
    } else if (error.code === "auth/email-already-in-use") {
      setError("This email is already in use.");
    } else if (error.code === "auth/invalid-email") {
      setError("Invalid email address.");
    } else if (error.code === "auth/weak-password") {
      setError("Password should be at least 6 characters long.");
    } else {
      setError(`An unexpected error occurred during ${type}.`);
    }

    // Start fade-out effect for errors
    const timer = setTimeout(() => setErrorFadeOut(true), 4000); // Trigger fade-out after 4 seconds
    const clearTimer = setTimeout(() => {
      setError("");
      setErrorFadeOut(false); // Reset fade-out state
    }, 5000); // Remove error after fade-out completes

    return () => {
      clearTimeout(timer);
      clearTimeout(clearTimer);
    };
  };

  return (
    <div>
      <Login
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        flashMessage={flashMessage}
        fadeOut={fadeOut}
        error={error}
        errorFadeOut={errorFadeOut}
      />
    </div>
  );
};

export default LoginPage;
