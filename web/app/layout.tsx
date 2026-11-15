import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./globals.css";
import BootstrapClient from './ui/BootstrapClient';
import 'bootstrap-icons/font/bootstrap-icons.css';
 
// Letras del estilo "Índigo moderno": Inter para el texto y Manrope para los títulos.
// next/font las descarga al compilar y las sirve desde la propia web (no hay pedido a Google).
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
 
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});
 
// Cada sección pone su título con un layout.js ("Panel · Convenios UNLPam"): así la pestaña
// y el lector de pantalla dicen en qué página se está (WCAG 2.4.2).
export const metadata: Metadata = {
  title: { default: "Convenios UNLPam", template: "%s · Convenios UNLPam" },
  description: "Gestión de convenios de la Universidad Nacional de La Pampa",
};
 
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${manrope.variable}`}
    >
      <body>{children}
      <BootstrapClient />
      </body>
      
    </html>
  );
}