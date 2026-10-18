import React from "react";
import { ENABLE_CUSTOM_INSTRUCTIONS, IDENTITY_MODE } from "@/config/experiment";

const LEVELS = ["beginner", "intermediate", "advanced"];

// label and placeholder for each identity mode
const IDENTITY_TEXT = {
  participant: { label: "Participant ID", placeholder: "e.g. PXXX" },
  name: { label: "Your name", placeholder: "e.g. Mina" },
};

/**
 * UserFields – the shared core of the profile form.
 *
 * Props:
 *   form        – { name, proficiency_level, preferences }
 *   set(k, v)   – updater from parent
 *   onSubmit    – called when Enter is pressed inside the name field
 *   nameRef     – optional ref forwarded to the name <input>
 *   children    – extra fields rendered after the core ones (e.g. language
 *                 pickers on the login page)
 *   styles      – CSS-module object from the parent
 */
export default function UserFields({ form, set, onSubmit, nameRef, children, styles }) {
  // fall back to "name" if the config value is misspelled
  const identity = IDENTITY_TEXT[IDENTITY_MODE] ?? IDENTITY_TEXT.name;

  return (
    <>
      <div className={styles.field}>
        <label className={styles.label}>
          {identity.label} <span className={styles.required}>*</span>
        </label>
        <input
          ref={nameRef}
          type="text"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit?.()}
          placeholder={identity.placeholder}
          className={styles.input}
          autoFocus={!nameRef}
        />
      </div>

      {/* slot for login-only extras (language pickers, etc.) */}
      {children}

      <div className={styles.field}>
        <label className={styles.label}>
          Proficiency level <span className={styles.required}>*</span>
        </label>
        <div className={styles.levelGroup}>
          {LEVELS.map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => set("proficiency_level", lvl)}
              className={`${styles.levelBtn} ${
                form.proficiency_level === lvl ? styles.levelBtnActive : ""
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* hidden while the experiment flag is off */}
      {ENABLE_CUSTOM_INSTRUCTIONS && (
        <div className={styles.field}>
          <label className={styles.label}>
            Custom instructions / Preferences <span className={styles.optional}>(optional)</span>
          </label>
          <textarea
            value={form.preferences}
            onChange={(e) => set("preferences", e.target.value)}
            placeholder="e.g. I need Spanish for work, but I also want to learn about the culture for travel in Spain..."
            className={styles.input}
            rows={3}
          />
        </div>
      )}
    </>
  );
}