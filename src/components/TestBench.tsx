"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotionPreference } from "@/lib/use-reduced-motion";

// Every figure comes from the material sheet published by Fateplas.
const HOLD_MS = 2200;
const MAX_TEMPERATURE = 60;

interface TestProps {
  done: boolean;
  onDone: () => void;
  reduced: boolean;
}

function PressureTest({ done, onDone, reduced }: TestProps) {
  const [value, setValue] = useState(0);
  const level = useRef(0);
  const holding = useRef(false);
  const raf = useRef(0);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const run = (previous: number) => {
    raf.current = requestAnimationFrame((now) => {
      const elapsed = Math.min(now - previous, 50);
      level.current = holding.current
        ? Math.min(1, level.current + elapsed / HOLD_MS)
        : Math.max(0, level.current - elapsed / 500);
      setValue(level.current);
      if (level.current === 1) {
        holding.current = false;
        onDone();
      } else if (level.current > 0 || holding.current) run(now);
    });
  };
  const hold = () => {
    if (done || holding.current) return;
    if (reduced) {
      level.current = 1;
      setValue(1);
      onDone();
      return;
    }
    holding.current = true;
    cancelAnimationFrame(raf.current);
    run(performance.now());
  };
  const release = () => {
    holding.current = false;
  };
  const shown = done ? 1 : value;

  return (
    <>
      <div className="bench-stage">
        <svg className="bench-ring" viewBox="0 0 200 200" aria-hidden="true">
          <circle cx="100" cy="100" r="86" pathLength="1" />
          <circle
            cx="100"
            cy="100"
            r="86"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={1 - shown}
          />
        </svg>
        <p className="bench-value" aria-live="off">
          {(shown * 7.8).toFixed(1).replace(".", ",")}
          <span>MPa</span>
        </p>
      </div>
      <button
        type="button"
        className="bench-action"
        disabled={done}
        onPointerDown={hold}
        onPointerUp={release}
        onPointerLeave={release}
        onPointerCancel={release}
        onContextMenu={(event) => event.preventDefault()}
        onKeyDown={(event) => {
          if ((event.key === " " || event.key === "Enter") && !event.repeat)
            hold();
        }}
        onKeyUp={release}
        onBlur={release}
      >
        {done ? "Equivale a 78 bar" : "Mantenga presionado"}
      </button>
    </>
  );
}

function TractionTest({ done, onDone, reduced }: TestProps) {
  const pull = useMotionValue(0);
  const spring = useSpring(pull, { stiffness: 260, damping: 17 });
  const width = useTransform(spring, (value) => `${76 + value * 16}%`);
  const start = useRef<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const tug = () => {
    onDone();
    if (reduced) return;
    pull.set(1);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => pull.set(0), 520);
  };

  return (
    <>
      <div
        className="bench-stage bench-weave-stage"
        onPointerDown={(event) => {
          if (reduced) return;
          start.current = event.clientX;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (start.current === null) return;
          const distance = Math.max(0, event.clientX - start.current);
          const value = 1 - Math.exp(-distance / 110);
          pull.set(value);
          if (value > 0.75) onDone();
        }}
        onPointerUp={() => {
          start.current = null;
          pull.set(0);
        }}
        onPointerCancel={() => {
          start.current = null;
          pull.set(0);
        }}
      >
        <motion.div className="bench-weave" style={{ width }}>
          <i aria-hidden="true" />
        </motion.div>
        <p className="bench-value">
          1100<span>dTex</span>
        </p>
      </div>
      <button type="button" className="bench-action" onClick={tug}>
        {done ? "Resiste la tracción" : "Tire de la tela"}
      </button>
    </>
  );
}

function TemperatureTest({ done, onDone }: TestProps) {
  const [degrees, setDegrees] = useState(18);
  const heat = (degrees - 5) / (MAX_TEMPERATURE - 5);
  return (
    <>
      <div
        className="bench-stage bench-heat-stage"
        style={{ "--heat": heat } as React.CSSProperties}
      >
        <div className="bench-heat" aria-hidden="true" />
        <p className="bench-value">
          {degrees}
          <span>°C</span>
        </p>
      </div>
      <label className="bench-slider">
        <span>{done ? "Máximo de trabajo" : "Suba la temperatura"}</span>
        <input
          type="range"
          min={5}
          max={MAX_TEMPERATURE}
          value={degrees}
          onChange={(event) => {
            const next = Number(event.target.value);
            setDegrees(next);
            if (next === MAX_TEMPERATURE) onDone();
          }}
          aria-valuetext={`${degrees} grados`}
        />
      </label>
    </>
  );
}

const tests: {
  layer: string;
  title: string;
  claim: string;
  detail: string;
  Test: (props: TestProps) => ReactNode;
}[] = [
  {
    layer: "Matriz de PVC",
    title: "Presión",
    claim: "Resistencia hidrostática mínima de 7,8 MPa.",
    detail: "Hermeticidad y baja fluencia.",
    Test: PressureTest,
  },
  {
    layer: "Soporte de poliéster",
    title: "Tracción",
    claim: "Trama de fibra mínima de 1100 dTex.",
    detail: "Resiste la tracción longitudinal y trapezoidal.",
    Test: TractionTest,
  },
  {
    layer: "Cubierta de poliéster",
    title: "Temperatura",
    claim: "Soporta hasta 60 °C.",
    detail: "Alta estabilidad fisicoquímica, libre de ftalatos.",
    Test: TemperatureTest,
  },
];

export default function TestBench({ children }: { children?: ReactNode }) {
  const [done, setDone] = useState([false, false, false]);
  const reduced = useReducedMotionPreference();
  const passed = done.filter(Boolean).length;
  const complete = (index: number) =>
    setDone((previous) =>
      previous[index]
        ? previous
        : previous.map((value, position) => value || position === index),
    );

  return (
    <div className="bench">
      <ol className="bench-tests">
        {tests.map(({ Test, ...test }, index) => (
          <li key={test.title} data-done={done[index]}>
            <div className="bench-head">
              <span>
                0{index + 1} · {test.layer}
              </span>
              <span className="bench-status">
                {done[index] ? "Superada" : "Pendiente"}
              </span>
            </div>
            <h3>{test.title}</h3>
            <Test
              done={done[index]}
              onDone={() => complete(index)}
              reduced={reduced}
            />
            <p className="bench-claim">{test.claim}</p>
            <p className="bench-detail">{test.detail}</p>
          </li>
        ))}
      </ol>
      <div className="bench-result" data-complete={passed === 3}>
        <p role="status">
          <strong>{passed}/3</strong>
          {passed === 3
            ? "Tres de tres. Ahora póngala en su prensa."
            : "pruebas superadas. Complete las tres."}
        </p>
        {children}
      </div>
    </div>
  );
}
