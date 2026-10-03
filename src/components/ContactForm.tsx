"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { withBasePath } from "@/lib/base-path";
import {
  CONTACT_LIMITS,
  validateContactFields,
  type ContactErrors,
} from "@/lib/contact-validation";

type SubmitStatus = "idle" | "pending" | "success" | "error";

function createSubmissionId() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  // getRandomValues is also available when a local preview uses plain HTTP.
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export default function ContactForm({
  suggestedMessage = "",
}: {
  suggestedMessage?: string;
}) {
  const preview = process.env.NEXT_PUBLIC_CONTACT_MODE === "placeholder";
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [notice, setNotice] = useState("");
  const [errors, setErrors] = useState<ContactErrors>({});
  const sending = useRef(false);
  const submission = useRef<{ id: string; fields: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const previousSuggestion = useRef("");
  useEffect(() => {
    const field = formRef.current?.elements.namedItem("message");
    if (
      field instanceof HTMLTextAreaElement &&
      suggestedMessage &&
      (!field.value || field.value === previousSuggestion.current)
    ) {
      field.value = suggestedMessage;
      previousSuggestion.current = suggestedMessage;
    }
  }, [suggestedMessage]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (preview) {
      setNotice("Vista previa: el formulario todavía no está habilitado.");
      return;
    }
    if (sending.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const result = validateContactFields({
      name: data.get("name"),
      email: data.get("email"),
      message: data.get("message"),
    });
    if (!result.ok) {
      setErrors(result.errors);
      setStatus("error");
      setNotice("Revisá los campos indicados.");
      const firstField = Object.keys(result.errors)[0];
      const input = form.elements.namedItem(firstField);
      if (input instanceof HTMLElement) input.focus();
      return;
    }

    sending.current = true;
    setStatus("pending");
    setNotice("");
    setErrors({});
    try {
      const fields = JSON.stringify(result.fields);
      if (!submission.current || submission.current.fields !== fields) {
        submission.current = { id: createSubmissionId(), fields };
      }
      const response = await fetch(withBasePath("/api/contact"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...result.fields,
          submissionId: submission.current.id,
          website: data.get("website"),
        }),
      });
      const payload: { message?: string; errors?: ContactErrors } =
        await response.json().catch(() => {
          throw new Error(
            "No pudimos confirmar tu mensaje. Intentá nuevamente en unos minutos.",
          );
        });
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        throw new Error(
          "No pudimos confirmar tu mensaje. Intentá nuevamente en unos minutos.",
        );
      }
      if (!response.ok) {
        setErrors(payload.errors || {});
        throw new Error(
          payload.message ||
            "No pudimos enviar tu mensaje. Intentá nuevamente.",
        );
      }
      form.reset();
      submission.current = null;
      setStatus("success");
      setNotice(payload.message || "¡Gracias! Recibimos tu mensaje.");
    } catch (error) {
      setStatus("error");
      setNotice(
        error instanceof Error && error.message !== "Failed to fetch"
          ? error.message
          : "No pudimos conectar. Revisá tu conexión e intentá nuevamente.",
      );
    } finally {
      sending.current = false;
    }
  }

  return (
    <form
      ref={formRef}
      className="contact-form"
      method="post"
      action={preview ? "#contacto" : withBasePath("/api/contact")}
      onSubmit={handleSubmit}
      noValidate
      aria-busy={status === "pending"}
    >
      <noscript>Activá JavaScript para enviar este formulario.</noscript>
      <div className="contact-field">
        <label className="contact-label" htmlFor="contact-name">
          Nombre{" "}
          <span className="contact-required" aria-hidden="true">
            *
          </span>
        </label>
        <input
          className="contact-input"
          id="contact-name"
          name="name"
          type="text"
          placeholder="Su nombre"
          autoComplete="name"
          maxLength={CONTACT_LIMITS.name}
          required
          disabled={status === "pending"}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
        />
        {errors.name && (
          <p className="contact-field-error" id="contact-name-error">
            {errors.name}
          </p>
        )}
      </div>
      <div className="contact-field">
        <label className="contact-label" htmlFor="contact-email">
          Email{" "}
          <span className="contact-required" aria-hidden="true">
            *
          </span>
        </label>
        <input
          className="contact-input"
          id="contact-email"
          name="email"
          type="email"
          placeholder="Su correo electrónico"
          autoComplete="email"
          maxLength={CONTACT_LIMITS.email}
          required
          disabled={status === "pending"}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
        />
        {errors.email && (
          <p className="contact-field-error" id="contact-email-error">
            {errors.email}
          </p>
        )}
      </div>
      <div className="contact-field">
        <label className="contact-label" htmlFor="contact-message">
          Mensaje{" "}
          <span className="contact-required" aria-hidden="true">
            *
          </span>
        </label>
        <textarea
          className="contact-input contact-textarea"
          id="contact-message"
          name="message"
          placeholder="Cuéntenos qué necesita"
          maxLength={CONTACT_LIMITS.message}
          required
          disabled={status === "pending"}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={
            errors.message ? "contact-message-error" : undefined
          }
        />
        {errors.message && (
          <p className="contact-field-error" id="contact-message-error">
            {errors.message}
          </p>
        )}
      </div>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clipPath: "inset(50%)",
        }}
      >
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <button
        className="contact-submit"
        type={preview ? "button" : "submit"}
        onClick={
          preview
            ? () =>
                setNotice(
                  "Vista previa: el formulario todavía no está habilitado.",
                )
            : undefined
        }
        disabled={status === "pending"}
      >
        {status === "pending" ? "Enviando..." : "Pedir cotización"}
      </button>
      <div
        className={`contact-status contact-status-${status}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {notice}
      </div>
    </form>
  );
}
