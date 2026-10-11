// lib/browserId.js
const KEY = "browser_id";

function makeId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  // fallback for plain http: 16 random bytes as hex
  const bytes = window.crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// Returns this browser's id, creating and saving it on the first call.
export function getBrowserId() {
  try {
    let id = window.localStorage.getItem(KEY);
    if (!id) {
      id = makeId();
      window.localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    // storage blocked (e.g. some private windows): id lasts for this page load only
    return makeId();
  }
}