import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const outfit = localFont({
  src: "../../public/fonts/Outfit-Latin.woff2",
  variable: "--font-outfit",
  weight: "100 900",
  display: "swap",
});
const poppins = localFont({
  src: "../../public/fonts/Poppins-Latin.woff2",
  variable: "--font-poppins",
  weight: "600",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Fateplas | Membranas a medida para prensas neumáticas",
  description:
    "Fabricamos en Mendoza membranas a medida para prensas neumáticas e hidroneumáticas. Tela de calidad alimenticia certificada, 1 año de garantía y asesoramiento.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR" className={`${outfit.variable} ${poppins.variable}`}>
      <body>{children}</body>
    </html>
  );
}
