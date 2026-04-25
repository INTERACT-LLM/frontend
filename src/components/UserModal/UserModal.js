import React from "react";
import styles from "./UserModal.module.css";
import UserFields from "@/components/UserFields/UserFields";

const DEFAULTS = {
  name: "",
  proficiency_level: "beginner",
  preferences: "",
};

export default function UserModal({ user, onSave, onClose }) {
  const [form, setForm] = React.useState(DEFAULTS);
  const firstInput = React.useRef(null);

  const isNew = !user;

  // sync form when user changes (fixes stale state bug)
  React.useEffect(() => {
    setForm(user ?? DEFAULTS);
  }, [user]);

  // sync focus when modal opens
  React.useEffect(() => {
    firstInput.current?.focus();
  }, []);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    const name = form.name.trim();
    if (!name) return;

    const updated = { ...form, name };

    localStorage.setItem("interactllm_user", JSON.stringify(updated));
    onSave(updated);
  }

  // sync Escape key handling globally (more reliable)
  React.useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isNew ? "Welcome — set up your profile" : "Your preferences"}
          </h2>
          <p className={styles.subtitle}>
            Saved locally in your browser.
          </p>
        </div>

        <UserFields
          form={form}
          set={set}
          onSubmit={handleSave}
          nameRef={firstInput}
          styles={styles}
        />

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