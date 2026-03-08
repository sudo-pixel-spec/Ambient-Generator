"use client";

import { useEffect, useRef } from "react";

interface CanvasVisualizerProps {
  activeEnv: string | null;
}

export default function CanvasVisualizer({ activeEnv }: CanvasVisualizerProps) {
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

    let droplets: Array<{x: number, y: number, speed: number, length: number, opacity: number}> = [];
    if (activeEnv === "Rain") {
        for (let i = 0; i < 200; i++) {
            droplets.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                speed: 15 + Math.random() * 20,
                length: 20 + Math.random() * 30,
                opacity: 0.1 + Math.random() * 0.3
            });
        }
    }

    let stars: Array<{x: number, y: number, radius: number, alpha: number, speed: number}> = [];
    if (activeEnv === "Night Sky") {
        for (let i = 0; i < 300; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.5,
                alpha: Math.random(),
                speed: 0.005 + Math.random() * 0.02
            });
        }
    }

    let embers: Array<{x: number, y: number, size: number, speedX: number, speedY: number, alpha: number, color: string}> = [];
    const colors = ["#ff5a00", "#ff9a00", "#ffce00", "#ff3300"];
    if (activeEnv === "Fireplace") {
        for(let i=0; i < 50; i++) {
            embers.push({
                x: canvas.width / 2 + (Math.random() * 200 - 100),
                y: canvas.height + Math.random() * 100,
                size: Math.random() * 4 + 1,
                speedX: (Math.random() - 0.5) * 2,
                speedY: -Math.random() * 3 - 1,
                alpha: Math.random(),
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }
    }
    
    let waveOffset = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(10, 10, 10, 0.4)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (activeEnv === "Rain") {
        ctx.strokeStyle = "#8baeb3";
        ctx.lineCap = "round";
        for (let dr of droplets) {
            ctx.beginPath();
            ctx.moveTo(dr.x, dr.y);
            ctx.lineTo(dr.x + dr.speed * 0.1, dr.y + dr.length);
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = `rgba(139, 174, 179, ${dr.opacity})`;
            ctx.stroke();

            dr.x += dr.speed * 0.1;
            dr.y += dr.speed;
            if (dr.y > canvas.height) {
                dr.y = -dr.length;
                dr.x = Math.random() * canvas.width;
            }
        }
      } else if (activeEnv === "Night Sky") {
        for (let st of stars) {
            ctx.beginPath();
            ctx.arc(st.x, st.y, st.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(Math.sin(st.alpha))})`;
            ctx.fill();
            st.alpha += st.speed;
        }
      } else if (activeEnv === "Fireplace") {
        const cx = canvas.width / 2;
        const cy = canvas.height - 50;

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 300);
        gradient.addColorStop(0, "rgba(255, 90, 0, 0.15)");
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let e of embers) {
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.size, 0, Math.PI*2);
            ctx.fillStyle = e.color;
            ctx.globalAlpha = e.alpha;
            ctx.fill();
            ctx.globalAlpha = 1.0;

            e.x += e.speedX + Math.sin(e.y * 0.05) * 0.5;
            e.y += e.speedY;
            e.alpha -= 0.005;

            if (e.alpha <= 0 || e.y < 0) {
                e.x = canvas.width / 2 + (Math.random() * 150 - 75);
                e.y = canvas.height + 10;
                e.alpha = 1;
            }
        }
      } else if (activeEnv === "Waves") {
          waveOffset += 0.01;
          const height = canvas.height;
          
          for (let w = 0; w < 3; w++) {
              ctx.beginPath();
              ctx.fillStyle = `rgba(10, ${80 + w * 40}, ${150 + w * 20}, ${0.1 + w * 0.05})`;
              ctx.moveTo(0, height);
              
              for (let x = 0; x <= canvas.width; x += 20) {
                  const y = height - (100 + w * 40) + Math.sin(x * 0.005 + waveOffset + w) * 30 + Math.sin(x * 0.01 - waveOffset * 2) * 20;
                  ctx.lineTo(x, y);
              }
              ctx.lineTo(canvas.width, height);
              ctx.fill();
          }
      }

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeEnv]);

  return (
    <canvas 
        ref={canvasRef} 
        style={{ width: "100%", height: "100%", display: "block" }} 
    />
  );
}
