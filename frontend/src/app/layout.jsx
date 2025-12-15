import "./globals.css";
import Link from "next/link";
import Navbar from "../components/Navbar";
import ConnectionStatus from "../components/ConnectionStatus";
import SpeedInsights from "../components/SpeedInsights";

export const metadata = {
  title: "Cimeika Interface",
  description: "Cimeika AI System Interface",
};
import "./globals.css";
import Link from "next/link";
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

        {/* Верхня навігація */}
        <header className="border-b border-slate-800">
          <Navbar />

          {/* Системна навігація */}
          <nav className="px-6 sm:px-10 py-3 text-sm text-slate-300 flex gap-6">
            <Link
              href="/encyclopedia"
              className="hover:text-white transition-colors"
            >
              Енциклопедія
            </Link>
          </nav>
        </header>

        {/* Основний контент */}
        <main className="min-h-screen p-6 sm:p-10">
          {children}
        </main>

        <ConnectionStatus />
      </body>
    </html>
  );
}