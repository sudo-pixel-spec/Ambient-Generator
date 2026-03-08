"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./page.module.css";
import CanvasVisualizer from "@/components/CanvasVisualizer";
import { AudioEngine } from "@/lib/AudioEngine";

const ENVIRONMENTS = ["Rain", "Waves", "Night Sky", "Fireplace"];

export default function Home() {
  const [activeEnv, setActiveEnv] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(0.5);
  const audioRef = useRef<AudioEngine | null>(null);

  useEffect(() => {
    audioRef.current = new AudioEngine();
    audioRef.current.setVolume(volume);
    return () => {
        audioRef.current?.stopAll();
    };
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioRef.current?.setVolume(val);
  };

  const handleEnvChange = (env: string) => {
    if (activeEnv === env) {
      setActiveEnv(null);
      audioRef.current?.stopAll();
    } else {
      setActiveEnv(env);
      if (env === "Rain") audioRef.current?.playRain();
      if (env === "Waves") audioRef.current?.playWaves();
      if (env === "Fireplace") audioRef.current?.playFireplace();
      if (env === "Night Sky") audioRef.current?.playNightSky();
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.mainStage}>
        <div className={styles.visualizer} id="visualizer-container">
          <CanvasVisualizer activeEnv={activeEnv} />
        </div>

        <div className={styles.controlsOverlay}>
          <div className={styles.header}>
            <h1 className={styles.title}>Ambient Generator</h1>
            <p className={styles.subtitle}>Immersive audiovisual relaxation</p>
          </div>

          <div className={styles.environmentSelector}>
            {ENVIRONMENTS.map((env) => (
              <button
                key={env}
                className={`${styles.envButton} ${activeEnv === env ? styles.active : ""}`}
                onClick={() => handleEnvChange(env)}
              >
                {env}
              </button>
            ))}
          </div>

          <div className={styles.volumeControl}>
            <label htmlFor="volumeSlider" className={styles.volumeLabel}>Volume</label>
            <input
              id="volumeSlider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className={styles.volumeSlider}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
