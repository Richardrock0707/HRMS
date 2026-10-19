import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VSecure HRMS | Enterprise Workforce Management",
  description:
    "VSecure Technologies HRMS - Enterprise Human Resource Management System with Geofenced GPS Attendance, Regional IST & INR Engine, and Cloud PostgreSQL Architecture.",
  applicationName: "VSecure HRMS",
  authors: [{ name: "VSecure Technologies" }],
  keywords: ["HRMS", "VSecure", "Attendance", "Geofence", "Payroll INR", "India IST"],
};

export const viewport: Viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} style={{ colorScheme: "light" }} suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light" />
      </head>
      <body
        className="spatial-wallpaper min-h-screen text-slate-900 antialiased selection:bg-blue-200 selection:text-blue-900"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
