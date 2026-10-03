"use client";

import Image from "next/image";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { withBasePath } from "@/lib/base-path";
import { useReducedMotionPreference } from "@/lib/use-reduced-motion";
import FabricField from "./FabricField";
import TestBench from "./TestBench";
import LayerInspector from "./LayerInspector";
import ClientWall, { all, clientCount } from "./ClientWall";
import QuoteBuilder, { initialQuote, type Quote } from "./QuoteBuilder";
import content from "./content.json";

const figures = [
  { value: "7,8 MPa", label: "Resistencia hidrostática mínima" },
  { value: "1100 dTex", label: "Trama de fibra mínima" },
  { value: "60 °C", label: "Temperatura máxima" },
  { value: "1 año", label: "Garantía de fabricación y material" },
];
const logos = [
  { image: "GrupoPeniaflor-1.svg", name: "Grupo Peñaflor" },
  { image: "Fecovita.png", name: "Fecovita" },
  { image: "Baggio.png", name: "Baggio" },
  { image: "Senetiner.svg", name: "Nieto Senetiner" },
  { image: "Takeda.svg", name: "Takeda" },
];
const rows = [all.slice(0, 22), all.slice(30, 52)];
const backing = [
  {
    figure: "1 año",
    title: "Garantía",
    text: "Cubre fallas de fabricación o de material desde el día de la entrega.",
  },
  {
    figure: "Sin ftalatos",
    title: "Apta para alimentos",
    text: "Tela certificada por el Centro de Investigaciones Toxicológicas S.A. Cumple la resolución Mercosur GMC Nº 32/10.",
  },
  {
    figure: "A medida",
    title: "Para su prensa",
    text: "Tomamos las dimensiones y la fabricamos, aunque el repuesto original ya no se consiga.",
  },
  {
    figure: "Kit",
    title: "De reparación",
    text: "Cubre un corte o una rajadura pequeña sin reemplazar la membrana.",
  },
];
const steps = [
  {
    title: "Consulta",
    text: "Nos indica la marca y el modelo de su prensa. Cotizamos la membrana para ese equipo.",
  },
  {
    title: "Medición",
    text: "Tomamos las medidas sin cargo en el Gran Mendoza. Desde otras zonas puede enviarnos la membrana a reemplazar.",
  },
  {
    title: "Fabricación",
    text: "Con una seña del 50 % comenzamos a fabricar su membrana a medida.",
  },
  {
    title: "Entrega",
    text: "Despacho gratis en el Gran Mendoza, con manual de uso y 1 año de garantía.",
  },
];

function Arrow() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export default function Experience() {
  const [paused, setPaused] = useState(false);
  const [quote, setQuote] = useState<Quote>(initialQuote);
  const [dock, setDock] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionPreference();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const progressTransform = useTransform(
    progress,
    (value) => `scaleX(${value})`,
  );
  const still = paused || reduced;

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-visible", "true");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    node
      .querySelectorAll("[data-reveal]")
      .forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  // The quote dock appears once the hero is gone and steps aside while the
  // quote itself is on screen.
  useEffect(() => {
    const node = root.current;
    const hero = node?.querySelector("#inicio");
    const target = node?.querySelector("#cotizar");
    if (!hero || !target) return;
    const seen = new Map<Element, boolean>([
      [hero, true],
      [target, false],
    ]);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => seen.set(entry.target, entry.isIntersecting));
      setDock(!seen.get(hero) && !seen.get(target));
    });
    observer.observe(hero);
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={root} className="experience" data-paused={still}>
      <a className="skip-link" href="#contenido">
        Ir al contenido
      </a>
      <motion.div
        className="reading-progress"
        style={{ transform: progressTransform }}
        aria-hidden="true"
      />
      <header className="experience-header">
        <a href="#inicio" className="wordmark" aria-label="Fateplas, inicio">
          FATEPLAS
          <span className="wordmark-dot" />
        </a>
        <nav aria-label="Navegación principal">
          <a href="#materiales">El corte</a>
          <a href="#pruebas">Pruebas</a>
          <a href="#respaldo">Respaldo</a>
          <a href="#clientes">Clientes</a>
        </nav>
        <a href="#cotizar" className="header-quote">
          Cotizar <Arrow />
        </a>
      </header>
      <main id="contenido">
        <section className="hero" id="inicio" aria-labelledby="hero-title">
          <FabricField paused={still} />
          <div className="hero-top">
            <span className="label">
              Membranas para prensas neumáticas e hidroneumáticas
            </span>
            <button
              type="button"
              className="hero-pause"
              aria-label={
                paused ? "Reanudar animaciones" : "Pausar animaciones"
              }
              aria-pressed={paused}
              onClick={() => setPaused(!paused)}
            >
              {paused ? "▷" : "Ⅱ"}
            </button>
          </div>
          <div className="hero-body">
            <h1 id="hero-title">
              <span className="headline-mask">
                <span>Membranas</span>
              </span>
              <span className="headline-mask">
                <span>hechas para</span>
              </span>
              <span className="headline-mask">
                <span>
                  <em>aguantar.</em>
                </span>
              </span>
            </h1>
            <div className="hero-side">
              <p>
                A medida para su prensa, con tela de calidad alimenticia
                certificada y 1 año de garantía. No nos crea: póngala a prueba.
              </p>
              <div className="hero-actions">
                <a href="#cotizar" className="button button-wine">
                  Cotizar mi membrana <Arrow />
                </a>
                <a href="#pruebas" className="hero-secondary">
                  Ponerla a prueba <span aria-hidden="true">↓</span>
                </a>
              </div>
            </div>
          </div>
          <ul className="hero-figures">
            {figures.map((figure) => (
              <li key={figure.value}>
                <strong>{figure.value}</strong>
                {figure.label}
              </li>
            ))}
          </ul>
          <div className="hatch" aria-hidden="true" />
        </section>
        <section
          className="trust"
          aria-label="Empresas que confían en Fateplas"
        >
          <div className="trust-head">
            <p>
              Más de {clientCount} bodegas y empresas prensan con Fateplas.{" "}
              <a href="#clientes">Ver la lista</a>
            </p>
            <div>
              {logos.map((logo) => (
                <Image
                  key={logo.name}
                  src={withBasePath(`/images/${logo.image}`)}
                  alt={logo.name}
                  width={160}
                  height={60}
                  sizes="(max-width: 600px) 100px, 140px"
                />
              ))}
            </div>
          </div>
          <div className="trust-names" aria-hidden="true">
            {rows.map((row, index) => (
              <div key={index}>
                {[...row, ...row].map((client, position) => (
                  <span key={position}>{client.name}</span>
                ))}
              </div>
            ))}
          </div>
        </section>
        <section
          id="materiales"
          className="material-section section-space"
          aria-labelledby="material-title"
        >
          <div className="section-heading" data-reveal="heading">
            <p>01 · El corte</p>
            <h2 id="material-title">
              Tres capas.
              <br />
              Ninguna de relleno.
            </h2>
            <div className="section-intro">
              Así es la tela por dentro. Recorra el corte o elija una capa para
              leer su ficha.
            </div>
          </div>
          <LayerInspector />
        </section>
        <section
          id="pruebas"
          className="bench-section section-space"
          aria-labelledby="bench-title"
        >
          <div className="section-heading" data-reveal="heading">
            <p>02 · Banco de pruebas</p>
            <h2 id="bench-title">
              No nos crea.
              <br />
              Pruébela.
            </h2>
            <div className="section-intro">
              Tres ensayos interactivos, uno por capa, con los valores de la
              ficha del material. Supere los tres.
            </div>
          </div>
          <TestBench>
            <a href="#cotizar" className="button button-wine">
              Cotizar mi membrana <Arrow />
            </a>
          </TestBench>
        </section>
        <section
          id="respaldo"
          className="backing-section section-space"
          aria-labelledby="backing-title"
        >
          <div className="section-heading" data-reveal="heading">
            <p>03 · Respaldo</p>
            <h2 id="backing-title">
              Y si algo falla,
              <br />
              respondemos.
            </h2>
            <div className="section-intro">
              Somos una empresa familiar de Mendoza. Sabemos lo que cuesta
              detener una producción.
            </div>
          </div>
          <ul className="backing">
            {backing.map((item) => (
              <li key={item.title}>
                <strong>{item.figure}</strong>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ul>
          <div className="certification">
            <Image
              src={withBasePath(
                "/images/cit-removebg-preview-e1663298242847.png",
              )}
              alt="Centro de Investigaciones Toxicológicas S.A."
              width={80}
              height={74}
            />
            <p>
              Tela de calidad alimenticia, aprobada y certificada por el Centro
              de Investigaciones Toxicológicas S.A.
            </p>
            <a
              href="#cotizar"
              className="text-link"
              onClick={() => setQuote({ ...quote, need: "kit", touched: true })}
            >
              Consultar por un kit <Arrow />
            </a>
          </div>
        </section>
        <section
          id="clientes"
          className="clients-section section-space"
          aria-labelledby="clients-title"
        >
          <figure className="testimonial" data-reveal="heading">
            <blockquote>
              &quot;Siempre le hemos comprado a Fateplas y no hemos tenido
              ningún problema. Me gusta mucho la calidad de la membrana y el
              servicio de atención. Se lo recomiendo a todos los colegas.&quot;
            </blockquote>
            <figcaption>
              <Image
                src={withBasePath("/images/Osvaldo-Colilaff.jpg")}
                alt=""
                width={140}
                height={140}
              />
              <span>
                Osvaldo Colilaf
                <span>Compras y licitaciones, RPB S.A. Cuyo</span>
              </span>
            </figcaption>
          </figure>
          <div className="section-heading">
            <p>04 · Clientes</p>
            <h2 id="clients-title">
              Más de {clientCount}
              <br />
              bodegas y empresas.
            </h2>
            <div className="section-intro">
              De Mendoza a Salta, Neuquén y Uruguay. Busque una bodega que
              conozca.
            </div>
          </div>
          <ClientWall />
        </section>
        <section
          id="cotizar"
          className="products-section section-space"
          aria-labelledby="product-title"
        >
          <div className="section-heading" data-reveal="heading">
            <p>05 · Cotización en un minuto</p>
            <h2 id="product-title">
              Su prensa.
              <br />
              Nuestra membrana.
            </h2>
            <div className="section-intro">
              Elija su equipo y le preparamos la consulta. Trabajamos todas las
              marcas del mercado.
            </div>
          </div>
          <QuoteBuilder quote={quote} onChange={setQuote} />
          <ol className="process">
            {steps.map((step, index) => (
              <li key={step.title}>
                <span aria-hidden="true">0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </section>
        <section
          className="faq-section section-space"
          aria-labelledby="faq-title"
        >
          <div className="faq-heading">
            <p>06 · Antes de elegir</p>
            <h2 id="faq-title">
              Las preguntas
              <br />
              que importan.
            </h2>
          </div>
          <div className="faq">
            {content.faq.map((item, index) => (
              <details key={item.title} name="faq">
                <summary>
                  <span aria-hidden="true">0{index + 1}</span>
                  {item.title}
                </summary>
                <div>
                  {item.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {item.list.length > 0 && (
                    <ul>
                      {item.list.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </details>
            ))}
          </div>
        </section>
        <section className="closing-section" aria-labelledby="closing-title">
          <p>Fabricación a medida, 1 año de garantía</p>
          <h2 id="closing-title">
            Que su producción
            <br />
            siga adelante.
          </h2>
          <div className="closing-actions">
            <a href="#cotizar" className="button button-wine">
              Cotizar mi membrana <Arrow />
            </a>
            <a href="tel:+542615114420">+54 261 5114420</a>
            <a href="mailto:fateplas@yahoo.com.ar">fateplas@yahoo.com.ar</a>
          </div>
          <address>Independencia 70, Godoy Cruz, Mendoza, Argentina</address>
        </section>
      </main>
      <footer className="experience-footer">
        <a href="#inicio" className="footer-wordmark">
          FATEPLAS
        </a>
        <div>
          <p>Fateplas de Vosso S.A.</p>
          <p>© {new Date().getFullYear()}</p>
          <a href="#inicio">Volver arriba ↑</a>
        </div>
      </footer>
      <div className="quote-dock" data-visible={dock} inert={!dock}>
        <a href="#cotizar" className="button button-wine">
          Cotizar mi membrana <Arrow />
        </a>
      </div>
    </div>
  );
}
