"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createUserWithEmailAndPassword, getRedirectResult, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, signOut as firebaseSignOut, updateProfile } from "firebase/auth";
import type { PublicUser } from "./types";
import { firebaseAuth } from "./firebase";

interface AuthContextValue {
  user: PublicUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signInWithGoogle: () => Promise<string | null>;
  register: (name: string, email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getRedirectResult(firebaseAuth).catch((error) => {
      console.error("Firebase redirect authentication error:", error?.code || error);
    });
    return onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      setUser(firebaseUser ? {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Citizen",
        email: firebaseUser.email || "",
      } : null);
      setIsLoading(false);
    });
  }, []);

  const firebaseErrorMessage = (error: unknown) => {
    const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
    console.error("Firebase authentication error:", code || error);
    if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) return "The email or password is incorrect.";
    if (code.includes("email-already-in-use")) return "An account with this email already exists.";
    if (code.includes("weak-password")) return "Your password must be at least 6 characters.";
    if (code.includes("invalid-email")) return "Please enter a valid email address.";
    if (code.includes("operation-not-allowed")) return "Google sign-in is not enabled in Firebase yet. Enable it in Authentication > Sign-in method.";
    if (code.includes("unauthorized-domain")) return "This website domain is not authorized in Firebase Authentication. Add localhost or your deployed domain under Authorized domains.";
    if (code.includes("popup-blocked")) return "Your browser blocked the Google sign-in popup. Allow popups for this website and try again.";
    if (code.includes("popup-closed-by-user")) return "The Google sign-in window was closed before authentication finished.";
    if (code.includes("invalid-api-key") || code.includes("app-not-authorized")) return "The Firebase web configuration is invalid. Check the Firebase API key and app ID.";
    if (code.includes("network-request-failed")) return "Firebase could not connect. Check your internet connection and try again.";
    return code ? `Firebase authentication failed (${code}). Check Firebase Authentication settings.` : "Unable to authenticate right now. Please try again.";
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
      return null;
    } catch (error) {
      return firebaseErrorMessage(error);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
      await updateProfile(credential.user, { displayName: name.trim() });
      setUser({ id: credential.user.uid, name: name.trim(), email: credential.user.email || email.trim() });
      return null;
    } catch (error) {
      return firebaseErrorMessage(error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
      return null;
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
      if (code.includes("popup-blocked") || code.includes("popup-timeout")) {
        await signInWithRedirect(firebaseAuth, new GoogleAuthProvider());
        return null;
      }
      return firebaseErrorMessage(error);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(firebaseAuth);
  };

  return <AuthContext.Provider value={{ user, isLoading, signIn, signInWithGoogle, register, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
