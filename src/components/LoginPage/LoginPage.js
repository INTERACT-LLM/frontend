"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./LoginPage.module.css";
import UserFields from "@/components/UserFields/UserFields";

const LANGUAGES = [
  "English", "Spanish", "French", "German",
  "Italian", "Portuguese", "Danish", "Swedish", "Norwegian",
];

const DEFAULTS = {
  name: "",
  proficiency_level: "beginner",
  preferences: "",
};

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState(DEFAULTS);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit() {
    if (!form.name.trim()) return;
    const data = { ...form, name: form.name.trim() };
    localStorage.setItem("interactllm_user", JSON.stringify(data));
    router.push("/");
  }

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.leftInner}>
          <p className={styles.wordmark}>InteractLLM</p>
          <div className={styles.taglineBlock}>
            <h1 className={styles.tagline}>
              Learn a language.<br />
              Have a conversation.
            </h1>
            <p className={styles.taglineSub}>
              AI-powered lessons built around real scenarios — not textbook drills.
            </p>
          </div>
          <p className={styles.leftFooter}>
            Your profile is saved locally.<br />No account needed.
          </p>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.form}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Set up your profile</h2>
            <p className={styles.formSub}>Takes 20 seconds. Personalises everything.</p>
          </div>

          <UserFields form={form} set={set} onSubmit={handleSubmit} styles={styles}>
            {/* lang pickers are login-only -> here as children */}
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>I speak</label>
                <select
                  value={form.nativeLanguage ?? "English"}
                  onChange={(e) => set("nativeLanguage", e.target.value)}
                  className={styles.input}
                >
                  {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>I'm learning</label>
                <select
                  value={form.learningLanguage ?? "Spanish"}
                  onChange={(e) => set("learningLanguage", e.target.value)}
                  className={styles.input}
                >
                  {LANGUAGES.filter((l) => l !== (form.nativeLanguage ?? "English")).map((l) => (
                    <option key={l}>{l}</option>
                  ))}
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