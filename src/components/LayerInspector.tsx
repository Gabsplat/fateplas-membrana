"use client";

import { useState, type CSSProperties } from "react";
import { withBasePath } from "@/lib/base-path";

// The original render stays whole and still: every mark is drawn over it.
const WIDTH = 615;
const HEIGHT = 420;
const layers = [
  {
    name: "Cubierta",
    material: "Poliéster",
    figure: "60 °C",
    caption: "Temperatura máxima de trabajo",
    surface: "M41 180 309 25 476 122 343 199 309 180 175 257Z",
    anchor: [283, 120],
    rows: [
      ["Material", "Poliéster"],
      ["Ftalatos", "Libre"],
      ["Estabilidad fisicoquímica", "Alta"],
    ],
  },
  {
    name: "Matriz",
    material: "PVC",
    figure: "7,8 MPa",
    caption: "Resistencia hidrostática mínima",
    surface: "M343 215 476 138 578 196 443 273Z",
    anchor: [467, 209],
    rows: [
      ["Material", "PVC"],
      ["Hermeticidad", "Sí"],
      ["Fluencia", "Baja"],
    ],
  },
  {
    name: "Soporte",
    material: "Poliéster",
    figure: "1100 dTex",
    caption: "Trama de fibra mínima",
    surface: "M309 215 175 295 309 372 443 288Z",
    anchor: [302, 313],
    rows: [
      ["Material", "Poliéster"],
      ["Tracción longitudinal", "Resiste"],
      ["Tracción trapezoidal", "Resiste"],
    ],
  },
] as const;

export default function LayerInspector() {
  const [pinned, setPinned] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [cursor, setCursor] = useState<[number, number] | null>(null);
  const active = hovered ?? pinned;
  const layer = layers[active];
  const code = `0${active + 1}`;

  return (
    <div className="inspector">
      <div className="inspector-sheet">
        <div className="inspector-plate" aria-hidden="true">
          <span>Plano 01</span>
          <span>Corte de la tela</span>
          <span>
            {cursor
              ? `X ${String(cursor[0]).padStart(3, "0")} · Y ${String(cursor[1]).padStart(3, "0")}`
              : "Recorra el corte"}
          </span>
        </div>
        <div
          className="inspector-scene"
          onPointerMove={(event) => {
            if (event.pointerType !== "mouse") return;
            const rect = event.currentTarget.getBoundingClientRect();
            setCursor([
              Math.round(((event.clientX - rect.left) / rect.width) * WIDTH),
              Math.round(((event.clientY - rect.top) / rect.height) * HEIGHT),
            ]);
          }}
          onPointerLeave={() => {
            setCursor(null);
            setHovered(null);
          }}
        >
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            role="img"
            aria-label="Corte de la tela de la membrana con sus tres capas: cubierta, matriz y soporte"
          >
            <image
              href={withBasePath("/images/membrane-layers.png")}
              width={WIDTH}
              height="406"
            />
            <path
              key={`veil-${active}`}
              className="inspector-veil"
              fillRule="evenodd"
              d={`M0 0H${WIDTH}V${HEIGHT}H0Z${layer.surface}`}
            />
            <path
              key={`outline-${active}`}
              className="inspector-outline"
              pathLength="1"
              d={layer.surface}
            />
            <path
              key={`leader-${active}`}
              className="inspector-leader"
              pathLength="1"
              d={`M${layer.anchor[0]} ${layer.anchor[1]}H${WIDTH}`}
            />
            {cursor && (
              <path
                className="inspector-cross"
                d={`M${cursor[0]} 0V${HEIGHT}M0 ${cursor[1]}H${WIDTH}`}
              />
            )}
            {layers.map((item, index) => (
              <path
                key={item.name}
                className="inspector-hit"
                d={item.surface}
                onPointerEnter={(event) => {
                  if (event.pointerType === "mouse") setHovered(index);
                }}
                onPointerLeave={() => setHovered(null)}
                onClick={() => setPinned(index)}
              />
            ))}
          </svg>
          {layers.map((item, index) => (
            <button
              type="button"
              key={item.name}
              className="inspector-tag"
              style={
                {
                  left: `${(item.anchor[0] / WIDTH) * 100}%`,
                  top: `${(item.anchor[1] / HEIGHT) * 100}%`,
                } as CSSProperties
              }
              aria-pressed={pinned === index}
              data-active={active === index}
              aria-label={`Ver ${item.name.toLowerCase()}`}
              onClick={() => setPinned(index)}
            >
              0{index + 1}
            </button>
          ))}
        </div>
      </div>
      <div className="inspector-card">
        <div
          className="inspector-tabs"
          role="group"
          aria-label="Capas de la tela"
          onKeyDown={(event) => {
            const step =
              event.key === "ArrowRight"
                ? 1
                : event.key === "ArrowLeft"
                  ? -1
                  : 0;
            if (!step) return;
            event.preventDefault();
            const next = (pinned + step + layers.length) % layers.length;
            setPinned(next);
            event.currentTarget
              .querySelectorAll<HTMLButtonElement>("button")
              [next]?.focus();
          }}
        >
          {layers.map((item, index) => (
            <button
              type="button"
              key={item.name}
              aria-pressed={pinned === index}
              data-active={active === index}
              onClick={() => setPinned(index)}
            >
              <span aria-hidden="true">0{index + 1}</span>
              {item.name}
            </button>
          ))}
        </div>
        <div className="inspector-data" aria-live="polite" key={active}>
          <p className="label">
            Capa {code}/03 · {layer.name} de {layer.material.toLowerCase()}
          </p>
          <p className="inspector-figure">{layer.figure}</p>
          <p className="inspector-caption">{layer.caption}</p>
          <dl>
            {layer.rows.map(([term, value]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
