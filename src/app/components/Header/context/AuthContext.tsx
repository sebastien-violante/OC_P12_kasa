"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { User } from "@/app/types/types";
import Cookies from "js-cookie";

type AuthContextType = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
};
const AuthContext = createContext<AuthContextType | undefined>(undefined);


function getUserFromCookie(): User | null {
  
  const cookie = Cookies.get("user");
  if (!cookie) {
    return null;
  }

  try {
    return JSON.parse(cookie) as User;
  } catch {
    return null;
  }
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  
  const [user, setUser] = useState<User | null>(() => {
    return getUserFromCookie()
  });

  const login = (user: User) => {
    setUser(user);
    Cookies.set("user", JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    Cookies.remove("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
