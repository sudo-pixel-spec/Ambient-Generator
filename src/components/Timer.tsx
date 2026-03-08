"use client";

import { useState, useEffect } from "react";
import styles from "./Timer.module.css";

export default function Timer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: number | undefined;

    if (isRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(25 * 60);
  };

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");

  return (
    <div className={styles.timerContainer}>
      <div className={styles.timerDisplay}>
        {minutes}:{seconds}
      </div>
      <div className={styles.timerControls}>
        <button className={styles.timerButton} onClick={toggleTimer}>
          {isRunning ? "Pause" : "Focus"}
        </button>
        <button className={styles.timerButton} onClick={resetTimer}>
          Reset
        </button>
      </div>
    </div>
  );
}
