"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./LoginPage.module.css";
import UserFields from "@/components/UserFields/UserFields";

const ALL_LANGUAGES = [
  "Danish", "English", "Spanish", "French", "German",
  "Italian", "Portuguese",
];

// languages your product intends to teach
const LEARNING_LANGUAGES = ["Spanish", "French", "German", "Danish"];

// languages currently available
const AVAILABLE_LANGUAGES = ["Spanish"];

const DEFAULTS = {
  name: "",
  proficiency_level: "beginner",
  preferences: "",
  nativeLanguage: "Danish",
  learningLanguage: "Spanish",
};

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState(DEFAULTS);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit() {
    if (!form.name.trim()) return;

    const data = {
      name: form.name.trim(),
      proficiency_level: form.proficiency_level,
      preferences: form.preferences,
      nativeLanguage: form.nativeLanguage,
      learningLanguage: form.learningLanguage,
      language: form.learningLanguage, // what the backend expects
    };

    localStorage.setItem("interactllm_user", JSON.stringify(data));
    router.push("/");
  }

  // only use learning languages here
  const learningOptions = LEARNING_LANGUAGES.filter(
    (l) => l !== form.nativeLanguage
  );

  const safeLearningLanguage = learningOptions.includes(form.learningLanguage)
    ? form.learningLanguage
    : "Spanish";

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.leftInner}>
          <p className={styles.wordmark}>InteractLLM</p>
          <div className={styles.taglineBlock}>
            <h1 className={styles.tagline}>
              Language grows<br />
              from meaningful interactions.
            </h1>
            <p className={styles.taglineSub}>
              Theory-driven. Task-based. AI-assisted.
            </p>
          </div>
          <p className={styles.leftFooter}>
            Prototype v1.0 <br /> Profiles are currently saved locally in your browser.
          </p>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.form}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Set up your profile</h2>
            <p className={styles.formSub}>
              Takes 20 seconds. Personalizes your experience.
            </p>
          </div>

          <UserFields form={form} set={set} onSubmit={handleSubmit} styles={styles}>
            <div className={styles.row}>
              {/* native language */}
              <div className={styles.field}>
                <label className={styles.label}>
                  I speak <span className={styles.required}>*</span>
                </label>
                <select
                  value={form.nativeLanguage}
                  onChange={(e) => set("nativeLanguage", e.target.value)}
                  className={styles.input}
                >
                  {ALL_LANGUAGES.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              {/* learning language */}
              <div className={styles.field}>
                <label className={styles.label}>
                  I'm learning <span className={styles.required}>*</span>
                </label>
                <select
                  value={safeLearningLanguage}
                  onChange={(e) => set("learningLanguage", e.target.value)}
                  className={styles.input}
                >
                  {learningOptions.map((l) => {
                    const isAvailable = AVAILABLE_LANGUAGES.includes(l);

                    return (
                      <option key={l} value={l} disabled={!isAvailable}>
                        {isAvailable ? l : `${l} (coming soon)`}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </UserFields>

          <button
            onClick={handleSubmit}
            disabled={!form.name.trim()}
            className={styles.submit}
          >
            Start learning →
          </button>
        </div>
      </div>
    </div>
  );
}