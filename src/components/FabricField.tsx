"use client";

import { useEffect, useRef } from "react";

// Slow folds of fabric: a few long threads that drift and lean gently
// towards the pointer.
const THREADS = 13;
const STEP = 14;
const REACH = 260;

export default function FabricField({ paused = false }: { paused?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const options = useRef({ paused });
  const sync = useRef<(() => void) | null>(null);

  useEffect(() => {
    options.current = { paused };
    sync.current?.();
  }, [paused]);

  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext("2d");
    if (!element || !context) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let visible = true;
    let raf = 0;
    let time = 0;
    let previous = 0;
    // The pointer is followed with a long ease so nothing ever jumps.
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, pull: 0, target: 0 };

    const resize = () => {
      const rect = element.getBoundingClientRect();
      const density = Math.min(devicePixelRatio || 1, 1.5);
      width = rect.width;
      height = rect.height;
      element.width = Math.round(width * density);
      element.height = Math.round(height * density);
      context.setTransform(density, 0, 0, density, 0, 0);
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      context.lineWidth = 1;
      for (let thread = 0; thread < THREADS; thread++) {
        const depth = thread / (THREADS - 1);
        const base = height * (0.3 + depth * 0.62);
        const swell = 14 + depth * 26;
        context.beginPath();
        for (let x = -STEP; x <= width + STEP; x += STEP) {
          const along = x / width;
          let y =
            base +
            Math.sin(along * 3.1 + time * 0.16 + thread * 0.42) * swell +
            Math.sin(along * 7.3 - time * 0.11 + thread * 0.9) * swell * 0.22;
          const distance = Math.hypot(x - pointer.x, y - pointer.y);
          if (distance < REACH)
            y += (1 - distance / REACH) ** 2 * 26 * pointer.pull;
          if (x === -STEP) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.strokeStyle =
          thread % 4 === 2
            ? "rgba(165, 54, 99, 0.42)"
            : `rgba(27, 28, 29, ${0.1 + depth * 0.1})`;
        context.stroke();
      }
    };

    const frame = (now: number) => {
      const elapsed = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      time += elapsed;
      pointer.x += (pointer.targetX - pointer.x) * 0.05;
      pointer.y += (pointer.targetY - pointer.y) * 0.05;
      pointer.pull += (pointer.target - pointer.pull) * 0.04;
      draw();
      raf = requestAnimationFrame(frame);
    };
    const update = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      if (options.current.paused || reduced.matches) {
        pointer.pull = 0;
        draw();
      } else if (visible && !document.hidden) {
        previous = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    sync.current = update;

    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = element.getBoundingClientRect();
      pointer.targetX = event.clientX - rect.left;
      pointer.targetY = event.clientY - rect.top;
      pointer.target = pointer.targetY < rect.height ? 1 : 0;
    };
    const leave = () => {
      pointer.target = 0;
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    const resizer = new ResizeObserver(() => {
      resize();
      update();
    });
    observer.observe(element);
    resizer.observe(element);
    addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", update);
    reduced.addEventListener("change", update);
    resize();
    update();
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      resizer.disconnect();
      removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", update);
      reduced.removeEventListener("change", update);
      sync.current = null;
    };
  }, []);

  return <canvas ref={canvas} className="fabric-field" aria-hidden="true" />;
}
