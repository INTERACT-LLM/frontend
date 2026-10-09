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

// the one place that writes the profile, mirrors loadUser
function saveUser(user) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    // storage blocked (e.g. private mode): the app still works for this visit
  }
}

// create the "channel" that components read the user from. Runs once, at file load.
const UserContext = createContext(null);

export function UserProvider({ children }) {
  // Holds the current user. When setUser is called, every component reading it re-renders.
  const [user, setUser] = useState(null);

  // Whether the profile modal is open.
  const [showModal, setShowModal] = useState(false);

  // Lets you navigate in code, e.g. send the user to /login.
  const router = useRouter();

  // The current URL path, e.g. "/lessons/game_tabu".
  const pathname = usePathname();

  // Runs after render, and again whenever pathname or router changes.
  // Loads the saved user, or redirects to /login if there is none.
  useEffect(() => {
    const stored = loadUser();
    if (stored) setUser(stored);
    else if (pathname !== "/login") router.replace("/login");
  }, [pathname, router]);

  function handleSave(updated) {
    saveUser(updated); // persist the edit so it survives reloads
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
  // Reads whatever UserProvider put into UserContext.
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside <UserProvider>");
  return ctx;
}