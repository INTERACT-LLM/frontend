"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";

const STORAGE_KEY = "interactllm_user";

export function loadUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearUser() {
  localStorage.removeItem(STORAGE_KEY);
  document.cookie = "interactllm_user=; path=/; max-age=0";
  setUser(null);
  router.push("/login");
}

export default function useUser() {
  const [user, setUser] = React.useState(null);
  const [showModal, setShowModal] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    const stored = loadUser();
    if (stored) {
      setUser(stored);
    } else if (pathname !== "/login") {
      router.replace("/login");
    }
  }, [pathname, router]);

  function handleSave(updated) {
    setUser(updated);
    setShowModal(false);
  }

  return {
    user,
    showModal,
    openModal: () => setShowModal(true),
    clearUser,
    modalProps: {
      user,
      onSave: handleSave,
      onClose: () => setShowModal(false),
    },
  };
}