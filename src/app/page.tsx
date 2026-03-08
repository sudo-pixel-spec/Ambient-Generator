"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./page.module.css";
import CanvasVisualizer from "@/components/CanvasVisualizer";
import Timer from "@/components/Timer";
import { AudioEngine } from "@/lib/AudioEngine";

const ENVIRONMENTS = ["Rain", "Waves", "Night Sky", "Fireplace", "Deep Forest", "Train Journey"];

export default function Home() {
  const [activeEnvs, setActiveEnvs] = useState<Record<string, number>>({});
  
  const [masterVolume, setMasterVolume] = useState<number>(0.5);
  const [zenMode, setZenMode] = useState<boolean>(false);
  const audioRef = useRef<AudioEngine | null>(null);

  const loadPreset = (preset: Record<string, number>) => {
      Object.keys(activeEnvs).forEach(env => {
          if (preset[env] === undefined) {
              audioRef.current?.stopTrack(env);
          }
      });
      Object.keys(preset).forEach(env => {
          if (activeEnvs[env] === undefined) {
              if (env === "Rain") audioRef.current?.playRain();
              if (env === "Waves") audioRef.current?.playWaves();
              if (env === "Fireplace") audioRef.current?.playFireplace();
              if (env === "Night Sky") audioRef.current?.playNightSky();
              if (env === "Deep Forest") audioRef.current?.playDeepForest();
              if (env === "Train Journey") audioRef.current?.playTrainJourney();
          }
          audioRef.current?.setTrackVolume(env, preset[env]);
      });
      setActiveEnvs({ ...preset });
  };

  useEffect(() => {
    audioRef.current = new AudioEngine();
    audioRef.current.setVolume(masterVolume);

    const handleMouseMove = (e: MouseEvent) => {
        if (!audioRef.current) return;
        const panValue = (e.clientX / window.innerWidth) * 2 - 1;
        audioRef.current.setPan(panValue * 0.6);
    };
    
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        audioRef.current?.stopAll();
    };
  }, []);

  const handleMasterVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setMasterVolume(val);
    audioRef.current?.setVolume(val);
  };

  const toggleEnv = (env: string) => {
    const newEnvs = { ...activeEnvs };
    if (newEnvs[env] !== undefined) {
      delete newEnvs[env];
      audioRef.current?.stopTrack(env);
    } else {
      newEnvs[env] = 0.5;
      if (env === "Rain") audioRef.current?.playRain();
      if (env === "Waves") audioRef.current?.playWaves();
      if (env === "Fireplace") audioRef.current?.playFireplace();
      if (env === "Night Sky") audioRef.current?.playNightSky();
      if (env === "Deep Forest") audioRef.current?.playDeepForest();
      if (env === "Train Journey") audioRef.current?.playTrainJourney();
      audioRef.current?.setTrackVolume(env, 0.5);
    }
    setActiveEnvs(newEnvs);
  };

  const handleTrackVolumeChange = (env: string, val: number) => {
      setActiveEnvs(prev => ({ ...prev, [env]: val }));
      audioRef.current?.setTrackVolume(env, val);
  };

  return (
    <div className={styles.container}>
      <main className={styles.mainStage}>
        {zenMode && (
           <div 
             className={styles.zenModeExitOverlay} 
             onClick={() => setZenMode(false)}
             onMouseMove={() => setZenMode(false)}
           />
        )}

        <div className={styles.visualizer} id="visualizer-container">
          <CanvasVisualizer activeEnvs={Object.keys(activeEnvs)} />
        </div>

        <div className={`${styles.controlsOverlay} ${zenMode ? styles.hidden : ""}`}>
          <div className={styles.headerRow}>
              <div>
                  <h1 className={styles.title}>Ambient Generator</h1>
                  <p className={styles.subtitle}>Mix your perfect environment</p>
              </div>
              <button className={styles.zenButton} onClick={() => setZenMode(true)}>
                  ☽ Zen Mode
              </button>
          </div>

          <div className={styles.presetsPanel}>
              <span className={styles.presetLabel}>Presets:</span>
              <button onClick={() => loadPreset({"Deep Forest": 0.8, "Rain": 0.3})} className={styles.presetButton}>Cozy Cabin</button>
              <button onClick={() => loadPreset({"Train Journey": 0.6, "Night Sky": 0.7, "Rain": 0.2})} className={styles.presetButton}>Midnight Express</button>
              <button onClick={() => { setActiveEnvs({}); audioRef.current?.stopAll(); }} className={styles.presetButton}>Clear All</button>
          </div>

          <div className={styles.environmentSelector}>
            {ENVIRONMENTS.map((env) => (
              <div key={env} className={styles.envTrackContainer}>
                  <button
                    className={`${styles.envButton} ${activeEnvs[env] !== undefined ? styles.active : ""}`}
                    onClick={() => toggleEnv(env)}
                  >
                    {env}
                  </button>
                  {activeEnvs[env] !== undefined && (
                      <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={activeEnvs[env]}
                          onChange={(e) => handleTrackVolumeChange(env, parseFloat(e.target.value))}
                          className={styles.trackSlider}
                      />
                  )}
              </div>
            ))}
          </div>

          <div className={styles.volumeControl}>
            <label htmlFor="masterVolumeSlider" className={styles.volumeLabel}>Master Volume</label>
            <input
              id="masterVolumeSlider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={masterVolume}
              onChange={handleMasterVolumeChange}
              className={styles.volumeSlider}
            />
          </div>

          <Timer />
        </div>
      </main>
    </div>
  );
}
