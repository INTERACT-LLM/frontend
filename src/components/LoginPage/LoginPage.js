"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./LoginPage.module.css";

const LANGUAGES = [
  "English", "Spanish", "French", "German",
  "Italian", "Portuguese", "Danish", "Swedish", "Norwegian",
];
const LEVELS = ["beginner", "intermediate", "advanced"];

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    nativeLanguage: "English",
    learningLanguage: "Spanish",
    level: "beginner",
  });

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

      {/* ── Left panel ── */}
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

      {/* ── Right panel ── */}
      <div className={styles.right}>
        <div className={styles.form}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Set up your profile</h2>
            <p className={styles.formSub}>Takes 20 seconds. Personalises everything.</p>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Your name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="e.g. Mina"
              className={styles.input}
              autoFocus
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>I speak</label>
              <select
                value={form.nativeLanguage}
                onChange={(e) => set("nativeLanguage", e.target.value)}
                className={styles.input}
              >
                {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>I'm learning</label>
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
          </div>

          <div className={styles.field}>
            <label className={styles.label}>My level</label>
            <div className={styles.levelGroup}>
              {LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => set("level", lvl)}
                  className={`${styles.levelBtn} ${form.level === lvl ? styles.levelBtnActive : ""}`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

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