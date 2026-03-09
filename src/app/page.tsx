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

  useEffect(() => {
    const hour = new Date().getHours();
    let mesh1 = "rgba(56, 189, 248, 0.08)";
    let mesh2 = "rgba(139, 92, 246, 0.08)";

    if (hour >= 5 && hour < 12) {
      mesh1 = "rgba(253, 186, 116, 0.12)";
      mesh2 = "rgba(125, 211, 252, 0.1)";
    } else if (hour >= 12 && hour < 17) {
      mesh1 = "rgba(250, 204, 21, 0.1)";
      mesh2 = "rgba(14, 165, 233, 0.12)";
    } else if (hour >= 17 && hour < 21) {
      mesh1 = "rgba(147, 51, 234, 0.12)";
      mesh2 = "rgba(249, 115, 22, 0.1)";
    } else {
      mesh1 = "rgba(30, 58, 138, 0.15)";
      mesh2 = "rgba(76, 29, 149, 0.12)";
    }
    
    document.documentElement.style.setProperty("--mesh-color-1", mesh1);
    document.documentElement.style.setProperty("--mesh-color-2", mesh2);
  }, []);

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
              if (env === "Snow Cabin") audioRef.current?.playSnowCabin();
          }
          audioRef.current?.setTrackVolume(env, preset[env]);
      });
      setActiveEnvs({ ...preset });
  };

  const generateSurprise = () => {
      const allOptions = ["Rain", "Waves", "Fireplace", "Night Sky", "Deep Forest", "Train Journey", "Snow Cabin"];
      const mixSize = Math.floor(Math.random() * 3) + 2;
      const shuffled = allOptions.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, mixSize);
      
      const newPreset: Record<string, number> = {};
      selected.forEach(env => {
          newPreset[env] = parseFloat((Math.random() * 0.6 + 0.3).toFixed(2));
      });
      loadPreset(newPreset);
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
              <button onClick={() => loadPreset({"Snow Cabin": 0.9, "Fireplace": 0.6})} className={styles.presetButton}>Blizzard Fire</button>
              <button onClick={generateSurprise} className={`${styles.presetButton} ${styles.surpriseBtn}`}>🎲 Surprise Me</button>
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
            <div key="Snow Cabin" className={styles.envTrackContainer}>
                <button
                    className={`${styles.envButton} ${activeEnvs["Snow Cabin"] !== undefined ? styles.active : ""}`}
                    onClick={() => toggleEnv("Snow Cabin")}
                >
                    Snow Cabin
                </button>
                {activeEnvs["Snow Cabin"] !== undefined && (
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={activeEnvs["Snow Cabin"]}
                        onChange={(e) => handleTrackVolumeChange("Snow Cabin", parseFloat(e.target.value))}
                        className={styles.trackSlider}
                    />
                )}
            </div>
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