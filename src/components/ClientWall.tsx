"use client";

import { useMemo, useState } from "react";
import content from "./content.json";

const regions = content.clients.map((region) => ({
  title: region.title,
  names: region.columns.flat().map((name) => name.replace(/\n/g, " ")),
}));
export const all = regions.flatMap((region) =>
  region.names.map((name) => ({ name, region: region.title })),
);
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
// Rows shown before the list is expanded: three lines of four columns.
const PREVIEW = 12;
export const clientCount =
  Math.floor(new Set(all.map((client) => normalize(client.name))).size / 10) *
  10;

export default function ClientWall() {
  const [region, setRegion] = useState(regions[0].title);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const search = normalize(query.trim());
  const visible = useMemo(
    () =>
      search
        ? all.filter((client) => normalize(client.name).includes(search))
        : all.filter((client) => client.region === region),
    [region, search],
  );

  const shown = search || expanded ? visible : visible.slice(0, PREVIEW);

  return (
    <div className="client-wall">
      <div className="client-wall-controls">
        <div
          className="client-regions"
          role="group"
          aria-label="Clientes por región"
        >
          {regions.map((item) => (
            <button
              type="button"
              key={item.title}
              aria-pressed={!search && region === item.title}
              onClick={() => {
                setQuery("");
                setExpanded(false);
                setRegion(item.title);
              }}
            >
              {item.title}
              <span>{item.names.length}</span>
            </button>
          ))}
        </div>
        <label className="client-search">
          <span className="sr-only">Buscar una empresa</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Busque una bodega"
            maxLength={60}
          />
        </label>
      </div>
      <p className="client-wall-status" role="status">
        {search
          ? `${visible.length} ${visible.length === 1 ? "resultado" : "resultados"} para "${query.trim()}"`
          : `${visible.length} ${visible.length === 1 ? "cliente" : "clientes"} en ${region}`}
      </p>
      <ul className="client-names">
        {shown.map((client, index) => (
          <li key={`${client.region}-${client.name}-${index}`}>
            {client.name}
            {search && <span>{client.region}</span>}
          </li>
        ))}
      </ul>
      {!search && visible.length > PREVIEW && (
        <button
          type="button"
          className="client-more"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded
            ? "Ver menos"
            : `Ver los ${visible.length} clientes de ${region}`}
          <span aria-hidden="true">{expanded ? "−" : "+"}</span>
        </button>
      )}
    </div>
  );
}
