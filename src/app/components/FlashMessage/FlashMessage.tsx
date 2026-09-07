"use client";

import { useState, useEffect } from "react";
import { FlashType } from "@/app/types/types";

export default function FlashMessage({ type, message }: FlashType) {
  const [isVisible, setIsVisible] = useState(true);

  const backgroundColors = {
    success: "#99331A",
    warning: "#565656",
    fail: "#0D0D0D"
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      style={{backgroundColor: backgroundColors[type], color: "white"}}
      className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg px-6 py-4 text-white shadow-lg`}
      //role={status ? "status" : "alert"}
      //aria-live={status ? "polite" : "assertive"}
    >
      {message}
    </div>
  );
}
