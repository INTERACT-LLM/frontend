// create a single user context to manage states (this context "owns" the user state)
"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { getBrowserId } from "@/lib/browserId";
import { ENABLE_CUSTOM_INSTRUCTIONS } from "@/config/experiment";

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

// Prepares a user object before the app sees it:
// 1. adds this browser's id (stored under its own key, so it survives logout)
// 2. applies experiment flags (blanks preferences when custom instructions are off)
function prepareUser(user) {
  return {
    ...user,
    browser_id: getBrowserId(),
    preferences: ENABLE_CUSTOM_INSTRUCTIONS ? user.preferences ?? "" : "",
  };
}

// create the "channel" that components read the user from. Runs once, at file load.
const UserContext = React.createContext(null);

export function UserProvider({ children }) {
  // Holds the current user. When setUser is called, every component reading it re-renders.
  const [user, setUser] = React.useState(null);

  // Whether the profile modal is open.
  const [showModal, setShowModal] = React.useState(false);

  // Lets you navigate in code, e.g. send the user to /login.
  const router = useRouter();

  // The current URL path, e.g. "/lessons/game_tabu".
  const pathname = usePathname();

  // Runs after render, and again whenever pathname or router changes.
  // Loads the saved user (prepared with browser id + experiment flags),
  // or redirects to /login if there is none.
  React.useEffect(() => {
    const stored = loadUser();
    if (stored) setUser(prepareUser(stored));
    else if (pathname !== "/login") router.replace("/login");
  }, [pathname, router]);

  function handleSave(updated) {
    const user = prepareUser(updated); // an edit can never drop the id or bypass the flags
    saveUser(user); // persist the edit so it survives reloads
    setUser(user);
    setShowModal(false);
  }

  function clearUser() {
    localStorage.removeItem(STORAGE_KEY); // removes the profile only, browser_id stays
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
  const ctx = React.useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside <UserProvider>");
  return ctx;
}