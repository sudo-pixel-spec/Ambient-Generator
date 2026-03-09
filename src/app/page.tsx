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
  const [proMode, setProMode] = useState<boolean>(false);
  const [masterMeter, setMasterMeter] = useState<number>(0);
  const audioRef = useRef<AudioEngine | null>(null);
  const requestRef = useRef<number>(0);

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
              if (env === "Thunderstorm") audioRef.current?.playThunderstorm();
          }
          audioRef.current?.setTrackVolume(env, preset[env]);
      });
      setActiveEnvs({ ...preset });
  };

  const generateSurprise = () => {
      const allOptions = ["Rain", "Waves", "Fireplace", "Night Sky", "Deep Forest", "Train Journey", "Snow Cabin", "Thunderstorm"];
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
    audioRef.current.setVolume(0.5);

    const handleVisibilityChange = () => {
        if (!audioRef.current) return;
        if (document.hidden) {
            audioRef.current.setMuffled(true);
        } else {
            audioRef.current.setMuffled(false);
        }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        audioRef.current?.stopAll();
    };
  }, []);

  useEffect(() => {
    const updateMeter = () => {
        if (audioRef.current && audioRef.current.analyserNode && proMode) {
            const dataArray = new Uint8Array(audioRef.current.analyserNode.frequencyBinCount);
            audioRef.current.analyserNode.getByteTimeDomainData(dataArray);
            
            let sumSquares = 0;
            for (let i = 0; i < dataArray.length; i++) {
                const normalized = (dataArray[i] / 128) - 1.0;
                sumSquares += normalized * normalized;
            }
            const rms = Math.sqrt(sumSquares / dataArray.length);
            setMasterMeter(Math.min(100, rms * 400));
        } else {
            setMasterMeter(0);
        }
        requestRef.current = requestAnimationFrame(updateMeter);
    };
    requestRef.current = requestAnimationFrame(updateMeter);

    const handleMouseMove = (e: MouseEvent) => {
        if (!audioRef.current || proMode) return;
        const panValue = (e.clientX / window.innerWidth) * 2 - 1;
        audioRef.current.setPan(panValue * 0.6);
    };
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [proMode]);

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
      if (env === "Snow Cabin") audioRef.current?.playSnowCabin();
      if (env === "Thunderstorm") audioRef.current?.playThunderstorm();
      audioRef.current?.setTrackVolume(env, 0.5);
    }
    setActiveEnvs(newEnvs);
  };

  const handleTrackVolumeChange = (env: string, val: number) => {
      setActiveEnvs(prev => ({...prev, [env]: val}));
      audioRef.current?.setTrackVolume(env, val);
  };

  const handleTrackPanChange = (env: string, val: number) => {
      audioRef.current?.setTrackPan(env, val);
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

        <div className={`${styles.kineticConsole} ${zenMode ? styles.hidden : ""}`}>
          
          <div className={`${styles.orbContainer} ${styles.orbTopLeft}`}>
              <button className={styles.orbButton} aria-label="Presets">
                 ✨
              </button>
              <div className={styles.drawerPanel}>
                  <div className={styles.drawerTitle}>Surprise Me</div>
                  <div className={styles.presetsPanel}>
                      <button onClick={() => loadPreset({"Deep Forest": 0.8, "Rain": 0.3})} className={styles.presetButton}>Cozy Cabin</button>
                      <button onClick={() => loadPreset({"Train Journey": 0.6, "Night Sky": 0.7, "Rain": 0.2})} className={styles.presetButton}>Midnight Express</button>
                      <button onClick={() => loadPreset({"Snow Cabin": 0.9, "Fireplace": 0.6})} className={styles.presetButton}>Blizzard Fire</button>
                      <button onClick={generateSurprise} className={`${styles.presetButton} ${styles.surpriseBtn}`}>🎲 Generate Random</button>
                      <button onClick={() => { setActiveEnvs({}); audioRef.current?.stopAll(); }} className={styles.presetButton}>Clear All</button>
                  </div>
              </div>
          </div>

          <div className={`${styles.orbContainer} ${styles.orbTopRight}`}>
              <button className={styles.orbButton} onClick={() => setZenMode(true)} aria-label="Zen Mode" title="Zen Mode">
                 ☽
              </button>
          </div>

          <div className={`${styles.orbContainer} ${styles.orbBottomLeft}`}>
              <button className={styles.orbButton} aria-label="Master Controls">
                 🎛️
              </button>
              <div className={styles.drawerPanel}>
                  <div className={styles.drawerTitle}>Pro Mixer</div>
                  <div className={styles.masterControlsBox}>
                      <div className={styles.volumeControl}>
                        <label className={styles.volumeLabel}>Master Gain</label>
                        <input 
                          type="range" 
                          min="0" max="1" step="0.01" 
                          value={masterVolume} 
                          onChange={handleMasterVolumeChange}
                          className={styles.volumeSlider}
                        />
                      </div>
                      
                      <div className={styles.proModeToggle}>
                          <label className={styles.proLabel}>
                              <input type="checkbox" checked={proMode} onChange={e => setProMode(e.target.checked)} />
                              Enable Pro Panning
                          </label>
                          {proMode && (
                              <div className={styles.meterContainer}>
                                  <div className={styles.meterFill} style={{ width: `${masterMeter}%` }} />
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          </div>

          <div className={`${styles.orbContainer} ${styles.orbBottomRight}`}>
              <button className={styles.orbButton} aria-label="Timer">
                 ⏱️
              </button>
              <div className={styles.drawerPanel}>
                   <div className={styles.drawerTitle}>Focus Session</div>
                   <Timer />
              </div>
          </div>

          <div className={styles.activeTrackStack}>
             {Object.keys(activeEnvs).map((env) => (
                <div key={`pod-${env}`} className={styles.trackPod}>
                    <div className={styles.podHeader}>
                        <span className={styles.podTitle}>{env}</span>
                        <button className={styles.podClose} onClick={() => toggleEnv(env)}>×</button>
                    </div>
                    <div className={styles.trackControls}>
                        <input 
                          type="range" 
                          min="0" max="1" step="0.01" 
                          value={activeEnvs[env]} 
                          onChange={(e) => handleTrackVolumeChange(env, parseFloat(e.target.value))}
                          className={styles.trackSlider}
                          title="Volume"
                        />
                        {proMode && (
                            <input 
                              type="range" 
                              min="-1" max="1" step="0.05" 
                              defaultValue="0"
                              onChange={(e) => handleTrackPanChange(env, parseFloat(e.target.value))}
                              className={styles.panSlider}
                              title="L/R Panning"
                            />
                        )}
                    </div>
                </div>
             ))}
          </div>

          <div className={styles.floatingDock}>
            {ENVIRONMENTS.map((env) => (
                <button 
                  key={`dock-${env}`}
                  className={`${styles.dockButton} ${activeEnvs[env] !== undefined ? styles.active : ""}`}
                  onClick={() => toggleEnv(env)}
                  data-tooltip={env}
                  aria-label={env}
                >
                  {env === "Rain" && "🌧️"}
                  {env === "Waves" && "🌊"}
                  {env === "Night Sky" && "🌌"}
                  {env === "Fireplace" && "🔥"}
                  {env === "Deep Forest" && "🌲"}
                  {env === "Train Journey" && "🚂"}
                </button>
            ))}
            <button
                key="dock-Snow-Cabin"
                className={`${styles.dockButton} ${activeEnvs["Snow Cabin"] !== undefined ? styles.active : ""}`}
                onClick={() => toggleEnv("Snow Cabin")}
                data-tooltip="Snow Cabin"
                aria-label="Snow Cabin"
            >
                ❄️
            </button>
            <button
                key="dock-Thunderstorm"
                className={`${styles.dockButton} ${activeEnvs["Thunderstorm"] !== undefined ? styles.active : ""}`}
                onClick={() => toggleEnv("Thunderstorm")}
                data-tooltip="Thunderstorm"
                aria-label="Thunderstorm"
            >
                ⚡
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
