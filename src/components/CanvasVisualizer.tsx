"use client";

import { useEffect, useRef } from "react";

interface CanvasVisualizerProps {
  activeEnvs: string[];
}

export default function CanvasVisualizer({ activeEnvs }: CanvasVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    const mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const droplets: Array<{x: number, y: number, speed: number, length: number, opacity: number}> = [];
    for (let i = 0; i < 200; i++) {
        droplets.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: 15 + Math.random() * 20,
            length: 20 + Math.random() * 30,
            opacity: 0.1 + Math.random() * 0.3
        });
    }
    
    const splashes: Array<{x: number, y: number, radius: number, alpha: number}> = [];

    const stars: Array<{x: number, y: number, radius: number, alpha: number, speed: number}> = [];
    for (let i = 0; i < 300; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.5,
            alpha: Math.random(),
            speed: 0.005 + Math.random() * 0.02
        });
    }

    const embers: Array<{x: number, y: number, size: number, speedX: number, speedY: number, alpha: number, color: string}> = [];
    const fireplaceColors = ["#ff5a00", "#ff9a00", "#ffce00", "#ff3300"];
    for(let i=0; i < 50; i++) {
        embers.push({
            x: canvas.width / 2 + (Math.random() * 200 - 100),
            y: canvas.height + Math.random() * 100,
            size: Math.random() * 4 + 1,
            speedX: (Math.random() - 0.5) * 2,
            speedY: -Math.random() * 3 - 1,
            alpha: Math.random(),
            color: fireplaceColors[Math.floor(Math.random() * fireplaceColors.length)]
        });
    }

    const fireflies: Array<{x: number, y: number, size: number, speedX: number, speedY: number, alpha: number, phase: number}> = [];
    for(let i=0; i < 80; i++) {
        fireflies.push({
            x: Math.random() * canvas.width,
            y: canvas.height / 1.5 + (Math.random() * canvas.height / 3),
            size: Math.random() * 2 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            alpha: Math.random(),
            phase: Math.random() * Math.PI * 2
        });
    }

    const trainLines: Array<{y: number, speed: number, alpha: number, width: number}> = [];
    for(let i=0; i < 30; i++) {
        trainLines.push({
            y: Math.random() * canvas.height,
            speed: 20 + Math.random() * 40,
            alpha: 0.05 + Math.random() * 0.15,
            width: 100 + Math.random() * 300
        });
    }
    
    const snowflakes: Array<{x: number, y: number, radius: number, speed: number, swayOffset: number}> = [];
    for(let i = 0; i < 150; i++) {
        snowflakes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 3 + 1,
            speed: Math.random() * 1.5 + 0.5,
            swayOffset: Math.random() * Math.PI * 2
        });
    }
    
    let globalWind = 0;

    let waveOffset = 0;

    const render = () => {
      globalWind = Math.sin(Date.now() * 0.0005) * 1.5 + Math.sin(Date.now() * 0.0002) * 0.5;

      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = "rgba(5, 5, 5, 0.4)"; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (activeEnvs.includes("Night Sky")) {
        ctx.globalCompositeOperation = "lighter";
        for (let st of stars) {
            ctx.beginPath();
            ctx.arc(st.x, st.y, st.radius, 0, Math.PI * 2);
            const flicker = Math.abs(Math.sin(st.alpha));
            ctx.fillStyle = `rgba(180, 220, 255, ${flicker * 0.8})`;
            ctx.shadowBlur = st.radius * 2;
            ctx.shadowColor = "#ffffff";
            ctx.fill();
            st.alpha += st.speed;
        }
        ctx.shadowBlur = 0;
        ctx.globalCompositeOperation = "source-over";
      } 
      
      if (activeEnvs.includes("Rain")) {
        ctx.strokeStyle = "#8baeb3";
        ctx.lineCap = "round";
        for (let dr of droplets) {
            ctx.beginPath();
            
            let deflectX = 0;
            const dx = dr.x - mouse.x;
            const dy = dr.y - mouse.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 150) {
                deflectX = (dx / dist) * (150 - dist) * 0.1;
            }

            const windPush = globalWind * (dr.speed * 0.05);

            ctx.moveTo(dr.x, dr.y);
            ctx.lineTo(dr.x + (dr.speed * 0.1) + deflectX + windPush, dr.y + dr.length);
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = `rgba(139, 174, 179, ${dr.opacity})`;
            ctx.stroke();

            dr.x += (dr.speed * 0.1) + deflectX + (windPush * 0.5);
            dr.y += dr.speed;
            
            
            if (dr.y > canvas.height) {
                splashes.push({x: dr.x, y: canvas.height - 2, radius: 1, alpha: Math.random() * 0.5 + 0.3});
                
                dr.y = -dr.length;
                dr.x = Math.random() * canvas.width;
            }
        }
        
        for (let i = splashes.length - 1; i >= 0; i--) {
            let sp = splashes[i];
            ctx.beginPath();
            ctx.ellipse(sp.x, sp.y, sp.radius * 2, sp.radius, 0, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(139, 174, 179, ${sp.alpha})`;
            ctx.stroke();
            sp.radius += 0.5;
            sp.alpha -= 0.05;
            if (sp.alpha <= 0) splashes.splice(i, 1);
        }
      } 
      
      if (activeEnvs.includes("Deep Forest")) {
          ctx.fillStyle = "rgba(5, 15, 10, 0.6)";
          ctx.beginPath();
          for(let i=0; i<5; i++) {
              let sway = Math.sin(Date.now() * 0.0005 + i) * 10;
              let baseX = canvas.width * 0.2 * i + canvas.width * 0.1;
              ctx.moveTo(baseX - 20, canvas.height);
              ctx.lineTo(baseX + sway, canvas.height * 0.3 + (i%2)*100);
              ctx.lineTo(baseX + 20, canvas.height);
          }
          ctx.fill();

          for(let f of fireflies) {
              f.phase += 0.05;
              let currentAlpha = f.alpha * (0.5 + Math.sin(f.phase) * 0.5);
              
              ctx.beginPath();
              ctx.arc(f.x, f.y, f.size, 0, Math.PI*2);
              ctx.fillStyle = `rgba(168, 255, 104, ${currentAlpha})`;
              ctx.shadowBlur = 10;
              ctx.shadowColor = "#a8ff68";
              ctx.fill();
              ctx.shadowBlur = 0;

              f.x += f.speedX + Math.sin(f.phase*0.2) * 0.5 + (globalWind * 0.3);
              f.y += f.speedY;

              if(f.x < 0) f.x = canvas.width;
              if(f.x > canvas.width) f.x = 0;
              if(f.y > canvas.height) f.y = 0;
              if(f.y < 0) f.y = canvas.height;
          }
      }

      if (activeEnvs.includes("Train Journey")) {
          ctx.globalCompositeOperation = "lighter";
          ctx.lineCap = "round";
          for (let l of trainLines) {
              ctx.beginPath();
              let xPos = (Date.now() * l.speed * 0.01) % (canvas.width * 2) - canvas.width;
              xPos = canvas.width - xPos;
              
              const isClose = l.speed > 40;
              ctx.moveTo(xPos, l.y);
              ctx.lineTo(xPos + l.width, l.y);
              ctx.lineWidth = isClose ? 8 : 2; 
              
              const r = isClose ? 255 : 180;
              const g = isClose ? 200 : 220;
              const b = isClose ? 150 : 255;
              
              ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${l.alpha})`;
              ctx.shadowBlur = isClose ? 15 : 0;
              ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 1)`;
              ctx.stroke();
          }
          ctx.shadowBlur = 0;
          ctx.globalCompositeOperation = "source-over";
      }

      if (activeEnvs.includes("Fireplace")) {
        ctx.globalCompositeOperation = "lighter";
        const cx = canvas.width / 2;
        const cy = canvas.height - 50;

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 300);
        gradient.addColorStop(0, "rgba(255, 60, 0, 0.4)");
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let e of embers) {
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.size, 0, Math.PI*2);
            ctx.fillStyle = e.color;
            ctx.globalAlpha = e.alpha;
            ctx.shadowBlur = e.size * 3;
            ctx.shadowColor = e.color;
            ctx.fill();
            ctx.globalAlpha = 1.0;
            ctx.shadowBlur = 0;

            let repelX = 0;
            let repelY = 0;
            const dx = e.x - mouse.x;
            const dy = e.y - mouse.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 150) {
                repelX = (dx / dist) * 2;
                repelY = (dy / dist) * 2;
            }

            e.x += e.speedX + Math.sin(e.y * 0.05) * 0.5 + repelX + (globalWind * 1.2);
            e.y += e.speedY + repelY;
            e.alpha -= 0.005;

            if (e.alpha <= 0 || e.y < 0) {
                e.x = canvas.width / 2 + (Math.random() * 200 - 100);
                e.y = canvas.height + 10;
                e.alpha = 1;
            }
        }
        ctx.globalCompositeOperation = "source-over";
      } 
      
      if (activeEnvs.includes("Snow Cabin")) {
          ctx.globalCompositeOperation = "lighter";
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          
          for(let flake of snowflakes) {
              ctx.beginPath();
              ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI*2);
              ctx.shadowBlur = flake.radius * 2;
              ctx.shadowColor = "#ffffff";
              ctx.fill();
              
              const sway = Math.sin(Date.now() * 0.001 + flake.swayOffset) * 0.5;
              
              flake.y += flake.speed;
              flake.x += sway + (globalWind * 1.5);
              
              if (flake.y > canvas.height) {
                  flake.y = -10;
                  flake.x = Math.random() * canvas.width;
              }
              if (flake.x > canvas.width) flake.x = 0;
              if (flake.x < 0) flake.x = canvas.width;
          }
          ctx.shadowBlur = 0;
          ctx.globalCompositeOperation = "source-over";
      }

      if (activeEnvs.includes("Waves")) {
          ctx.globalCompositeOperation = "lighter";
          waveOffset += 0.008;
          const height = canvas.height;
          
          for (let w = 0; w < 4; w++) {
              ctx.beginPath();
              
              const waveGrad = ctx.createLinearGradient(0, height - 200, 0, height);
              waveGrad.addColorStop(0, `rgba(15, ${100 + w * 30}, ${200 + w * 10}, ${0.15})`);
              waveGrad.addColorStop(1, `rgba(5, 20, 50, 0.8)`);
              
              ctx.fillStyle = waveGrad;
              ctx.moveTo(0, height);
              
              for (let x = 0; x <= canvas.width + 20; x += 20) {
                  const y = height - (80 + w * 40) 
                            + Math.sin(x * 0.003 + waveOffset + w) * 40 
                            + Math.sin(x * 0.01 - waveOffset * 2) * 15;
                  ctx.lineTo(x, y);
              }
              ctx.lineTo(canvas.width, height);
              ctx.fill();
          }
          ctx.globalCompositeOperation = "source-over";
      }

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeEnvs]);

  return (
    <canvas 
        ref={canvasRef} 
        style={{ width: "100%", height: "100%", display: "block" }} 
    />
  );
}
