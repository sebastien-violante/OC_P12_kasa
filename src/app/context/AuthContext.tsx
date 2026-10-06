"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import type { User } from "@/app/types/types";
import Cookies from "js-cookie";

type AuthContextType = {
  user: User | null;
  login: (user: User) => void;
  updateUser: (user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getUserFromCookie(): User | null {
  const cookie = Cookies.get("user");

  if (!cookie) {
    return null;
  }

  try {
    const parsed = JSON.parse(cookie);
    return parsed.user as User;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = getUserFromCookie();
    console.log("🟢 AUTH COOKIE USER :", storedUser);
    setUser(storedUser);
  }, []);

  const login = (user: User) => {
    console.log("🟢 AUTH LOGIN USER :", user);
    setUser(user);
    Cookies.set("user", JSON.stringify(user));
  };

  const updateUser = (user: User) => {
     console.log("🟢 updateUser reçoit :", user);
  console.log("🟢 updateUser reçoit ID :", user.id);
    setUser(user);
    Cookies.set("user", JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);

    Cookies.remove("user");
    Cookies.remove("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}