"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./Timer.module.css";
import { AudioEngine } from "@/lib/AudioEngine";

export default function Timer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  
  const audioRef = useRef<AudioEngine | null>(null);

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60).toString().padStart(2, "0");
    const seconds = (timeInSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
      const saved = localStorage.getItem("ambient_sessions");
      if (saved) {
          setSessionsCompleted(parseInt(saved, 10));
      }
      
      audioRef.current = new AudioEngine();
  }, []);

  useEffect(() => {
    let interval: number | undefined;

    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsActive(false);
            window.clearInterval(interval);
            
            if (audioRef.current) {
                audioRef.current.playChime();
            }
            
            const newCount = sessionsCompleted + 1;
            setSessionsCompleted(newCount);
            localStorage.setItem("ambient_sessions", newCount.toString());
            
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
        setIsActive(false);
        if (audioRef.current) {
            audioRef.current.playChime();
        }
        const newCount = sessionsCompleted + 1;
        setSessionsCompleted(newCount);
        localStorage.setItem("ambient_sessions", newCount.toString());
    }


    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, sessionsCompleted]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
  };

  return (
    <div className={styles.timerContainer}>
      <div className={styles.timeDisplay}>{formatTime(timeLeft)}</div>
      
      {sessionsCompleted > 0 && (
          <div className={styles.sessionCounter}>
              ⭐ {sessionsCompleted} Focus Sessions Completed
          </div>
      )}

      <div className={styles.controls}>
        <button className={styles.btn} onClick={toggleTimer}>
          {isActive ? "Pause" : "Start"}
        </button>
        <button className={styles.btn} onClick={resetTimer}>
          Reset
        </button>
      </div>
    </div>
  );
}
