import "./globals.css";

import { Analytics } from "@vercel/analytics/next";
import Navbar from "../components/Navbar";
import ConnectionStatus from "../components/ConnectionStatus";
import SpeedInsights from "../components/SpeedInsights";

export const metadata = {
  title: "Cimeika Interface",
  description: "Cimeika AI System Interface",
};

export default function RootLayout({ children }) {
  return (
    <html lang="uk">
      <body className="bg-slate-950 text-slate-50 antialiased">
        <SpeedInsights />
        <Navbar />
        <main className="min-h-screen p-6 sm:p-10">{children}</main>
        <ConnectionStatus />
        <Analytics />
      </body>
    </html>
  );
}