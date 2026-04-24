// create a single user context to manage states (this context "owns" the user state)
"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const STORAGE_KEY = "interactllm_user";

function loadUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const stored = loadUser();
    if (stored) setUser(stored);
    else if (pathname !== "/login") router.replace("/login");
  }, [pathname, router]);

  function handleSave(updated) {
    setUser(updated);
    setShowModal(false);
  }

  function clearUser() {
    localStorage.removeItem(STORAGE_KEY);
    document.cookie = "interactllm_user=; path=/; max-age=0";
    setUser(null);
    router.push("/login");
  }

  return (
    <UserContext.Provider value={{
      user,
      showModal,
      openModal: () => setShowModal(true),
      clearUser,
      modalProps: {
        user,
        onSave: handleSave,
        onClose: () => setShowModal(false),
      },
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside <UserProvider>");
  return ctx;
}