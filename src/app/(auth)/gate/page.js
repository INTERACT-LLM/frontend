"use client";
import React from "react";
import { useRouter } from "next/navigation";
import styles from "./gate.module.css";

export default function GatePage() {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit() {
    if (!password || submitting) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("Incorrect password.");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.gate}>
      <div className={styles.card}>
        <div className={styles.eyebrow}>
          <span className={styles.dot} />
          <span>RESEARCH PROTOTYPE</span>
        </div>

        <h1 className={styles.wordmark}>InteractLLM</h1>

        <div className={styles.copy}>
          <p className={styles.body}>
            This site is a research prototype and currently requires a password
            provided by the developer.
          </p>
          <p className={styles.bodyMuted}>
            If you believe you should have access but don't, please write to{" "}
            <a href={`mailto:${"mina"}\u0040${"cc.au.dk"}`} className={styles.link}>mina [at] cc.au.dk</a>.
          </p>
        </div>

        <div className={styles.formBlock}>
          <label className={styles.label} htmlFor="gate-password">
            Password
          </label>
          <input
            id="gate-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
            className={styles.input}
            autoFocus
            autoComplete="off"
            spellCheck={false}
          />
          <div className={styles.errorSlot}>
            {error && <p className={styles.error}>{error}</p>}
          </div>
          <button
            onClick={handleSubmit}
            disabled={!password || submitting}
            className={styles.button}
          >
            {submitting ? "Checking…" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}