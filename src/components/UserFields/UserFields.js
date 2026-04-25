import React from "react";

const LEVELS = ["beginner", "intermediate", "advanced"];

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
  return (
    <>
      <div className={styles.field}>
        <label className={styles.label}>Your name</label>
        <input
          ref={nameRef}
          type="text"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit?.()}
          placeholder="e.g. Mina"
          className={styles.input}
          autoFocus={!nameRef}
        />
      </div>

      {/* slot for login-only extras (language pickers, etc.) */}
      {children}

      <div className={styles.field}>
        <label className={styles.label}>Proficiency level</label>
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

      <div className={styles.field}>
        <label className={styles.label}>Your preferences</label>
        <textarea
          value={form.preferences}
          onChange={(e) => set("preferences", e.target.value)}
          placeholder="e.g. I like to small-talk and want to learn about culture. I need Spanish for work."
          className={styles.input}
          rows={3}
        />
      </div>
    </>
  );
}