import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";
import Login from "../components/Login";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 300; // 5 minutes in seconds

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  const [flashMessage, setFlashMessage] = useState("");
  const [fadeOut, setFadeOut] = useState(false);
  const [error, setError] = useState("");
  const [errorFadeOut, setErrorFadeOut] = useState(false);

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutEndTime, setLockoutEndTime] = useState(null);

  // Initialize lockout state from localStorage
  useEffect(() => {
    const storedLockoutEndTime = localStorage.getItem("lockoutEndTime");
    if (storedLockoutEndTime) {
      const endTime = Number(storedLockoutEndTime);
      if (new Date().getTime() < endTime) {
        setIsLocked(true);
        setLockoutEndTime(endTime);
      }
    }
  }, []);

  // Countdown timer for lockout
  useEffect(() => {
    let timer;
    if (isLocked && lockoutEndTime) {
      timer = setInterval(() => {
        const timeLeft = lockoutEndTime - new Date().getTime();
        if (timeLeft <= 0) {
          setIsLocked(false);
          setFailedAttempts(0);
          setLockoutEndTime(null);
          localStorage.removeItem("lockoutEndTime");
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isLocked, lockoutEndTime]);

  useEffect(() => {
    if (location.state?.message) {
      setFlashMessage(location.state.message);

      const timer = setTimeout(() => setFadeOut(true), 4000);
      const clearTimer = setTimeout(() => {
        setFlashMessage("");
        setFadeOut(false);
      }, 5000);

      return () => {
        clearTimeout(timer);
        clearTimeout(clearTimer);
      };
    }
  }, [location.state]);

  const handleSignIn = async (email, password) => {
    if (isLocked) {
      const remainingTime = Math.ceil((lockoutEndTime - new Date().getTime()) / 1000);
      const minutes = Math.floor(remainingTime / 60);
      const seconds = remainingTime % 60;
      setError(`Too many failed attempts. Try again in ${minutes}m ${seconds}s.`);
      return;
    }

    setError("");
    setErrorFadeOut(false);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      setFailedAttempts(0); // Reset failed attempts on successful login
      navigate("/");
    } catch (error) {
      handleFirebaseError(error, "login");
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        const lockoutEndTime = new Date().getTime() + LOCKOUT_DURATION * 1000;
        setIsLocked(true);
        setLockoutEndTime(lockoutEndTime);
        localStorage.setItem("lockoutEndTime", lockoutEndTime);
      }
    }
  };

  const handleSignUp = async (email, password) => {
    setError("");
    setErrorFadeOut(false);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      navigate("/");
    } catch (error) {
      handleFirebaseError(error, "signup");
    }
  };

  const handleFirebaseError = (error, type) => {
    console.log("Firebase Error:", error);
    const errorCode = error.code;

    switch (errorCode) {
      case "auth/invalid-credential":
      case "auth/user-not-found":
        setError("Invalid email or password. Please try again.");
        break;
      case "auth/email-already-in-use":
        setError("This email is already in use.");
        break;
      case "auth/invalid-email":
        setError("Invalid email address.");
        break;
      case "auth/weak-password":
        setError("Password should be at least 6 characters long.");
        break;
      default:
        setError(`An unexpected error occurred during ${type}.`);
        break;
    }

    const timer = setTimeout(() => setErrorFadeOut(true), 4000);
    const clearTimer = setTimeout(() => {
      setError("");
      setErrorFadeOut(false);
    }, 5000);

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
        isLocked={isLocked}
        lockoutTime={
          lockoutEndTime
            ? Math.max(lockoutEndTime - new Date().getTime(), 0) / 1000
            : 0
        }
      />
    </div>
  );
};

export default LoginPage;
