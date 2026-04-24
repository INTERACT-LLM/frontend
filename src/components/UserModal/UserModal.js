import React from "react";
import styles from "./UserModal.module.css";

const LANGUAGES = [
  "English", "Spanish", "French", "German",
  "Italian", "Portuguese", "Danish", "Swedish", "Norwegian",
];
const LEVELS = ["beginner", "intermediate", "advanced"];

export default function UserModal({ user, onSave, onClose }) {
  const DEFAULTS = {
    name: "",
    nativeLanguage: "English",
    learningLanguage: "Spanish",
    level: "beginner",
  };

  const [form, setForm] = React.useState(user || DEFAULTS);
  const firstInput = React.useRef(null);
  const isNew = !user;

  React.useEffect(() => {
    firstInput.current?.focus();
  }, []);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSave() {
    if (!form.name.trim()) return;
    const updated = { ...form, name: form.name.trim() };
    localStorage.setItem("interactllm_user", JSON.stringify(updated));
    onSave(updated);
  }

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isNew ? "Welcome — set up your profile" : "Your preferences"}
          </h2>
          <p className={styles.subtitle}>
            {isNew
              ? "Saved locally in your browser. You can change this any time."
              : "Saved locally in your browser."}
          </p>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Your name</label>
          <input
            ref={firstInput}
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="e.g. Mina"
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Native language</label>
          <select
            value={form.nativeLanguage}
            onChange={(e) => set("nativeLanguage", e.target.value)}
            className={styles.input}
          >
            {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Learning</label>
          <select
            value={form.learningLanguage}
            onChange={(e) => set("learningLanguage", e.target.value)}
            className={styles.input}
          >
            {LANGUAGES.filter((l) => l !== form.nativeLanguage).map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Level</label>
          <div className={styles.levelGroup}>
            {LEVELS.map((lvl) => (
              <button
                key={lvl}
                onClick={() => set("level", lvl)}
                className={`${styles.levelBtn} ${form.level === lvl ? styles.levelBtnActive : ""}`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.actions}>
          {!isNew && (
            <button onClick={onClose} className={styles.btnSecondary}>
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!form.name.trim()}
            className={styles.btnPrimary}
          >
            {isNew ? "Get started →" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}