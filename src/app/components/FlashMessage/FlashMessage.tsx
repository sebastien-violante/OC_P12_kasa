"use client";

import { useState, useEffect } from "react";

type FlashMessageProps = {
  status: boolean;
  message: string;
};

export default function FlashMessage({ status, message }: FlashMessageProps) {
  const [isVisible, setIsVisible] = useState(true);

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
      className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg ${
        status ? "bg-green-500" : "bg-red-500"
      } px-6 py-4 text-white shadow-lg`}
      role={status ? "status" : "alert"}
      aria-live={status ? "polite" : "assertive"}
    >
      {message}
    </div>
  );
}
