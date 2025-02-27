import { createContext, useContext, useEffect, useState, useMemo } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { app } from "../config/firebase";
import usersApi from "../api/users";
import { User } from "../types/user.types";
import axios from "axios";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  register: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  signIn: async () => {
    throw new Error("Not implemented");
  },
  register: async () => {
    throw new Error("Not implemented");
  },
  signOut: async () => {
    throw new Error("Not implemented");
  },
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = auth.onIdTokenChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const idToken = await firebaseUser.getIdToken();
          localStorage.setItem("token", idToken);
          axios.defaults.headers.common["Authorization"] = `Bearer ${idToken}`;

          try {
            // Fetch user data from backend
            const userData = await usersApi.getCurrentUser();
            setCurrentUser(userData);
          } catch (error) {
            console.error("Error fetching user data:", error);
            setCurrentUser(null);
          }
        } else {
          localStorage.removeItem("token");
          delete axios.defaults.headers.common["Authorization"];
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Token refresh error:", error);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const signIn = async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const idToken = await userCredential.user.getIdToken();

    localStorage.setItem("token", idToken);
    axios.defaults.headers.common["Authorization"] = `Bearer ${idToken}`;

    const userData = await usersApi.getCurrentUser();
    setCurrentUser(userData);
    return userData;
  };

  const register = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<void> => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const idToken = await userCredential.user.getIdToken();

    localStorage.setItem("token", idToken);
    axios.defaults.headers.common["Authorization"] = `Bearer ${idToken}`;

    // Create user in backend
    await usersApi.register({
      user_id: userCredential.user.uid,
      full_name: fullName,
      email,
      role: "Customer", // Default role
    });

    const userData = await usersApi.getCurrentUser();
    setCurrentUser(userData);
  };

  const signOut = async () => {
    await auth.signOut();
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setCurrentUser(null);
  };

  const value = useMemo(
    () => ({
      currentUser,
      loading,
      signIn,
      register,
      signOut,
    }),
    [currentUser, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
