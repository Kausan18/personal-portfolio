import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kaustubh Shandilya — Portfolio",
  description:
    "Full-stack developer & data engineer. Building intelligent systems with Python, React, FastAPI, and modern AI tooling.",
  keywords: [
    "Kaustubh Shandilya",
    "portfolio",
    "full-stack developer",
    "data engineer",
    "Python",
    "React",
    "FastAPI",
  ],
  authors: [{ name: "Kaustubh Shandilya" }],
  openGraph: {
    title: "Kaustubh Shandilya — Portfolio",
    description:
      "Full-stack developer & data engineer. Building intelligent systems with Python, React, FastAPI, and modern AI tooling.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${spaceMono.variable}`}
    >
      <body
        className="antialiased"
        style={{ backgroundColor: "#080814", color: "#ffffff" }}
      >
        {children}
      </body>
    </html>
  );
}