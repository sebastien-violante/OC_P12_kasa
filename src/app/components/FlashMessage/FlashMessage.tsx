"use client";

import { useState, useEffect } from "react";

type FlashMessageProps = {
  status: boolean;
  message: string;
};

/**
 * Affiche temporairement un message de succès ou d'erreur.
 *
 * Le message est automatiquement masqué après deux secondes et son rôle
 * ARIA est adapté selon son statut afin de faciliter son annonce par les
 * technologies d'assistance.
 */
export default function FlashMessage({
  status,
  message,
}: FlashMessageProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(true);

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [message, status]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`flashMessage z-[500] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg ${
        status ? "bg-emerald-700" : "bg-red-800"
      } px-6 py-4 text-white shadow-lg`}
      role={status ? "status" : "alert"}
      aria-live={status ? "polite" : "assertive"}
    >
      {message}
    </div>
  );
}