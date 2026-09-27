"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createUserWithEmailAndPassword, deleteUser as firebaseDeleteUser, EmailAuthProvider, getRedirectResult, GoogleAuthProvider, onAuthStateChanged, reauthenticateWithCredential, reauthenticateWithPopup, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, signOut as firebaseSignOut, updateProfile } from "firebase/auth";
import { collection, getDocs, writeBatch } from "firebase/firestore";
import type { PublicUser } from "./types";
import { firebaseAuth, firestore } from "./firebase";

interface AuthResult {
  error: string | null;
  notice: string | null;
}

interface AuthContextValue {
  user: PublicUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  register: (name: string, email: string, password: string) => Promise<AuthResult>;
  deleteAccount: (password?: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const allowUnverifiedDuringAuthFlow = useRef(false);

  useEffect(() => {
    getRedirectResult(firebaseAuth).catch((error) => {
      console.error("Firebase redirect authentication error:", error?.code || error);
    });
    return onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (firebaseUser && !firebaseUser.emailVerified) {
        setUser(null);
        if (!allowUnverifiedDuringAuthFlow.current) {
          await firebaseSignOut(firebaseAuth).catch((error) => {
            console.error("Unable to sign out unverified Firebase user:", error);
          });
        }
        setIsLoading(false);
        return;
      }

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
    if (code.includes("user-not-found")) return "No account exists for this email address. Check the address or create an account.";
    if (code.includes("invalid-credential") || code.includes("wrong-password")) return "The email or password is incorrect.";
    if (code.includes("email-already-in-use")) return "An account with this email already exists.";
    if (code.includes("weak-password")) return "Your password must be at least 6 characters.";
    if (code.includes("invalid-email")) return "Please enter a valid email address.";
    if (code.includes("operation-not-allowed")) return "Google sign-in is not enabled in Firebase yet. Enable it in Authentication > Sign-in method.";
    if (code.includes("unauthorized-domain")) return "This website domain is not authorized in Firebase Authentication. Add localhost or your deployed domain under Authorized domains.";
    if (code.includes("popup-blocked")) return "Your browser blocked the Google sign-in popup. Allow popups for this website and try again.";
    if (code.includes("popup-closed-by-user")) return "The Google sign-in window was closed before authentication finished.";
    if (code.includes("invalid-api-key") || code.includes("app-not-authorized")) return "The Firebase web configuration is invalid. Check the Firebase API key and app ID.";
    if (code.includes("network-request-failed")) return "Firebase could not connect. Check your internet connection and try again.";
    if (code.includes("requires-recent-login")) return "Please sign in again before deleting your account.";
    return code ? `Firebase authentication failed (${code}). Check Firebase Authentication settings.` : "Unable to authenticate right now. Please try again.";
  };

  const signIn = async (email: string, password: string) => {
    allowUnverifiedDuringAuthFlow.current = true;
    try {
      const credential = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
      if (!credential.user.emailVerified) {
        await sendEmailVerification(credential.user);
        await firebaseSignOut(firebaseAuth);
        return { error: null, notice: "Please verify your email address. We sent you a new verification link." };
      }
      return { error: null, notice: null };
    } catch (error) {
      if (firebaseAuth.currentUser && !firebaseAuth.currentUser.emailVerified) {
        await firebaseSignOut(firebaseAuth).catch(() => undefined);
      }
      return { error: firebaseErrorMessage(error), notice: null };
    } finally {
      allowUnverifiedDuringAuthFlow.current = false;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    allowUnverifiedDuringAuthFlow.current = true;
    try {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
      await updateProfile(credential.user, { displayName: name.trim() });
      await sendEmailVerification(credential.user);
      await firebaseSignOut(firebaseAuth);
      return { error: null, notice: "Registration is pending email verification. We sent a verification link to this address. The account cannot be used until you verify it; check that the address is correct and look in your spam folder if the message does not arrive." };
    } catch (error) {
      if (firebaseAuth.currentUser && !firebaseAuth.currentUser.emailVerified) {
        await firebaseSignOut(firebaseAuth).catch(() => undefined);
      }
      return { error: firebaseErrorMessage(error), notice: null };
    } finally {
      allowUnverifiedDuringAuthFlow.current = false;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(firebaseAuth, email.trim());
      return { error: null, notice: "If an account exists for this email, a password reset link has been sent." };
    } catch (error) {
      return { error: firebaseErrorMessage(error), notice: null };
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
      return { error: null, notice: null };
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
      if (code.includes("popup-blocked") || code.includes("popup-timeout")) {
        try {
          await signInWithRedirect(firebaseAuth, new GoogleAuthProvider());
          return { error: null, notice: null };
        } catch (redirectError) {
          return { error: firebaseErrorMessage(redirectError), notice: null };
        }
      }
      return { error: firebaseErrorMessage(error), notice: null };
    }
  };

  const deleteAccount = async (password?: string) => {
    const firebaseUser = firebaseAuth.currentUser;
    if (!firebaseUser || !firebaseUser.email) {
      return { error: "Sign in again before deleting your account.", notice: null };
    }

    let reportsMayHaveBeenDeleted = false;
    try {
      const providerIds = firebaseUser.providerData.map((provider) => provider.providerId);
      if (providerIds.includes("google.com")) {
        await reauthenticateWithPopup(firebaseUser, new GoogleAuthProvider());
      } else if (providerIds.includes("password")) {
        if (!password) return { error: "Enter your current password to confirm account deletion.", notice: null };
        const credential = EmailAuthProvider.credential(firebaseUser.email, password);
        await reauthenticateWithCredential(firebaseUser, credential);
      } else {
        return { error: "This sign-in method cannot reauthenticate account deletion here. Contact support.", notice: null };
      }

      const reportSnapshot = await getDocs(collection(firestore, "users", firebaseUser.uid, "reports"));
      for (let offset = 0; offset < reportSnapshot.docs.length; offset += 450) {
        const batch = writeBatch(firestore);
        reportSnapshot.docs.slice(offset, offset + 450).forEach((report) => batch.delete(report.ref));
        await batch.commit();
        reportsMayHaveBeenDeleted = true;
      }

      await firebaseDeleteUser(firebaseUser);
      return { error: null, notice: null };
    } catch (error) {
      if (reportsMayHaveBeenDeleted) {
        return { error: "Some or all of your reports were deleted, but account deletion could not finish. Retry deletion or contact support.", notice: null };
      }
      return { error: firebaseErrorMessage(error), notice: null };
    }
  };

  const signOut = async () => {
    await firebaseSignOut(firebaseAuth);
  };

  return <AuthContext.Provider value={{ user, isLoading, signIn, resetPassword, signInWithGoogle, register, deleteAccount, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
