"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { User } from "../types/types";
import Cookies from "js-cookie";
import { useEffect } from "react";
import getRequest from "../utils/getRequest";
import type { GetProfileData } from "@/types/types";

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadProfile = async () => {
    const token = Cookies.get("token");
    if (!token) {
      setProfile(null);
      return;
    }
    try {
      const url = "/api/auth/profile";
      const result = await getRequest<GetProfileData>({ url, token });
      const profile = result.data?.user;
      if (profile) setProfile(profile);
    } catch (error) {
      setProfile(null);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, setProfile, loadProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("erreur de contexte");
  }

  return context;
}
