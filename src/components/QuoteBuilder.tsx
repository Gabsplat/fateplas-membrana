"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { withBasePath } from "@/lib/base-path";
import { useReducedMotionPreference } from "@/lib/use-reduced-motion";
import ContactForm from "./ContactForm";

const ease = [0.23, 1, 0.32, 1] as const;
const machines = [
  {
    brand: "Bucher Vaslin",
    title: "Bucher XPert",
    image: "Bucher_XPert.png",
    width: 584,
    height: 394,
  },
  {
    brand: "Della Toffola",
    title: "Della Toffola",
    image: "Della-Toffola.png",
    width: 630,
    height: 405,
  },
  {
    brand: "Diemme",
    title: "Diemme Velvet T26",
    image: "Diemme-Velvet_T26.png",
    width: 689,
    height: 424,
  },
];
const brands = [
  "Buccolini",
  "Bucher Vaslin",
  "Defranceschi",
  "Della Toffola",
  "Diemme",
  "Pera",
  "Siprem",
  "Velo",
  "Willmes",
  "Otra marca",
];
export const needs = [
  { id: "membrana", label: "Una membrana nueva" },
  { id: "kit", label: "Un kit de reparación" },
  { id: "asesoramiento", label: "Asesoramiento" },
] as const;
export type Need = (typeof needs)[number]["id"];
export interface Quote {
  brand: string;
  model: string;
  need: Need;
  local: boolean | null;
  touched: boolean;
}
export const initialQuote: Quote = {
  brand: "Bucher Vaslin",
  model: "",
  need: "membrana",
  local: null,
  touched: false,
};

export function quoteMessage({ brand, model, need, local }: Quote) {
  const press = `${brand === "Otra marca" ? "una prensa de otra marca" : `una prensa ${brand}`}${model.trim() ? `, modelo ${model.trim()}` : ""}`;
  const request = {
    membrana: `Quisiera cotizar una membrana para ${press}.`,
    kit: `Quisiera consultar por un kit de reparación para la membrana de ${press}.`,
    asesoramiento: `Necesito asesoramiento sobre la membrana de ${press}.`,
  }[need];
  const place =
    local === null
      ? ""
      : local
        ? " Mi planta está en el Gran Mendoza."
        : " Mi planta está fuera del Gran Mendoza.";
  return request + place;
}

export default function QuoteBuilder({
  quote,
  onChange,
}: {
  quote: Quote;
  onChange: (quote: Quote) => void;
}) {
  const [instant, setInstant] = useState(false);
  const reduced = useReducedMotionPreference();
  const machine = machines.find((item) => item.brand === quote.brand);
  const update = (change: Partial<Quote>) =>
    onChange({ ...quote, ...change, touched: true });
  const message = quote.touched ? quoteMessage(quote) : "";
  const mail = `mailto:fateplas@yahoo.com.ar?subject=${encodeURIComponent("Consulta por membrana")}&body=${encodeURIComponent(message || quoteMessage(quote))}`;

  return (
    <div className="quote">
      <div className="quote-config">
        <div className="press-visual">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              className="press-image"
              key={quote.brand}
              initial={{
                opacity: 0,
                transform: instant || reduced ? "none" : "translateX(22px)",
              }}
              animate={{ opacity: 1, transform: "translateX(0px)" }}
              exit={{ opacity: 0 }}
              transition={{ duration: instant || reduced ? 0 : 0.22, ease }}
            >
              {machine ? (
                <Image
                  src={withBasePath(`/images/${machine.image}`)}
                  width={machine.width}
                  height={machine.height}
                  alt={`Prensa ${machine.title}`}
                  sizes="(max-width: 800px) 85vw, 45vw"
                />
              ) : (
                <div className="custom-press">
                  <svg viewBox="0 0 360 220" aria-hidden="true">
                    <path
                      d="M50 55h255v112H50zM50 55c-45 0-45 112 0 112M305 55c45 0 45 112 0 112M80 167v34m185-34v34M28 88h24m251 0h24M65 56v110"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                  <span>Tomamos las medidas y la fabricamos</span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          <div className="press-caption">
            <span>{machine?.title || quote.brand}</span>
            <span>Prensa neumática</span>
          </div>
        </div>
        <div className="press-controls">
          <fieldset>
            <legend>
              <span aria-hidden="true">01</span>¿Con qué prensa trabaja?
            </legend>
            <div className="brand-options">
              {brands.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={
                    quote.brand === item
                      ? "brand-option selected"
                      : "brand-option"
                  }
                  aria-pressed={quote.brand === item}
                  onClick={(event) => {
                    setInstant(event.detail === 0);
                    update({ brand: item });
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
            <label className="model-label" htmlFor="press-model">
              Modelo de la prensa <span>Opcional</span>
            </label>
            <input
              id="press-model"
              value={quote.model}
              onChange={(event) => update({ model: event.target.value })}
              maxLength={100}
              placeholder="Por ejemplo, XPert 50"
            />
          </fieldset>
          <fieldset>
            <legend>
              <span aria-hidden="true">02</span>¿Qué necesita?
            </legend>
            <div className="brand-options">
              {needs.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={
                    quote.need === item.id
                      ? "brand-option selected"
                      : "brand-option"
                  }
                  aria-pressed={quote.need === item.id}
                  onClick={() => update({ need: item.id })}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>
              <span aria-hidden="true">03</span>¿Dónde está su planta?
            </legend>
            <div className="brand-options">
              {[
                { label: "Gran Mendoza", value: true },
                { label: "Otra zona", value: false },
              ].map((item) => (
                <button
                  type="button"
                  key={item.label}
                  className={
                    quote.local === item.value
                      ? "brand-option selected"
                      : "brand-option"
                  }
                  aria-pressed={quote.local === item.value}
                  onClick={() => update({ local: item.value })}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="selector-note" role="status">
              {quote.local === null
                ? "Si no conoce el modelo, podemos asesorarlo."
                : quote.local
                  ? "Toma de medidas y despacho sin cargo."
                  : "Puede enviarnos la membrana a reemplazar o pedir la medición en su planta."}
            </p>
          </fieldset>
        </div>
      </div>
      <div className="quote-form" id="contacto">
        <p className="quote-form-step">
          <span aria-hidden="true">04</span>Reciba su cotización
        </p>
        <h3>Ya redactamos su consulta. Solo faltan sus datos.</h3>
        <ContactForm suggestedMessage={message} />
        <div className="quote-direct">
          <span>O escríbanos directo</span>
          <a href={mail}>Enviar por correo</a>
          <a href="tel:+542615114420">+54 261 5114420</a>
        </div>
      </div>
    </div>
  );
}
