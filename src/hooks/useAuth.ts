import { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { User, UserRole, Permission } from "@/types";

// Default permissions by role
const getDefaultPermissions = (role: UserRole): Permission[] => {
  switch (role) {
    case "admin":
      return [
        "manage_users",
        "manage_packages",
        "view_payments",
        "manage_payments",
        "upload_documents",
        "download_documents",
        "view_all_documents",
        "create_custom_packages",
        "send_notifications",
      ];
    case "employee":
      return [
        "view_payments",
        "upload_documents",
        "download_documents",
        "view_all_documents",
        "send_notifications",
      ];
    case "client":
      return ["upload_documents", "download_documents", "view_own_documents"];
    default:
      return [];
  }
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Firebase services are not available, set loading to false immediately
    if (!auth || !db) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        try {
          if (firebaseUser && db) {
            const adminEmail = "admin@ecobusinessbd.com";
            const isAdminEmail =
              (firebaseUser.email || "").toLowerCase() === adminEmail;

            // Try read once; do not write unless the doc is missing
            const userRef = doc(db, "Users", firebaseUser.uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
              const data = userDoc.data() as Record<string, unknown>;
              const roleRaw = (data.role ??
                (data as Record<string, unknown>).Role) as string | undefined;
              let normalizedRole = (roleRaw || "User").toString().toLowerCase();
              if (isAdminEmail) normalizedRole = "admin";
              const allowedRoles: UserRole[] = ["admin", "employee", "client"];
              const computedRole: UserRole = allowedRoles.includes(
                normalizedRole as UserRole
              )
                ? (normalizedRole as UserRole)
                : "client";
              setUser({
                ...(data as unknown as User),
                role: computedRole,
                lastLoginAt: Timestamp.now(),
              });
            } else {
              setUser(null);
            }
          } else {
            setUser(null);
          }
        } catch (e) {
          // If Firestore read fails (e.g., rules), still allow app to function with minimal user
          if (firebaseUser) {
            const isAdminEmail =
              (firebaseUser.email || "").toLowerCase() ===
              "admin@ecobusinessbd.com";
            const minimal = {
              id: firebaseUser.uid,
              email: firebaseUser.email || "",
              role: isAdminEmail ? "admin" : "client",
              displayName: firebaseUser.displayName ?? null,
              photoURL: firebaseUser.photoURL ?? null,
              lastLoginAt: Timestamp.now(),
            } as unknown as User;
            setUser(minimal);
          } else {
            setUser(null);
          }
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!auth) {
      throw new Error("Firebase auth not initialized");
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  };

  // Note: signup is handled directly in SignupForm to simplify the flow per requirements.

  const signOut = async () => {
    if (!auth) {
      throw new Error("Firebase auth not initialized");
    }
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    if (!auth) {
      throw new Error("Firebase auth not initialized");
    }
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Password reset error:", error);
      throw error;
    }
  };

  // Helper methods for role-based access control
  const hasPermission = (permission: Permission): boolean => {
    return user?.permissions.includes(permission) || false;
  };

  const isAdmin = (): boolean => {
    return user?.role === "admin" || false;
  };

  const isEmployee = (): boolean => {
    return user?.role === "employee" || false;
  };

  const isClient = (): boolean => {
    return user?.role === "client" || false;
  };

  return {
    user,
    loading,
    signIn,
    signOut,
    resetPassword,
    hasPermission,
    isAdmin,
    isEmployee,
    isClient,
  };
};
