import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "Cimeika Interface",
  description: "Cimeika AI System Interface",
};

export default function RootLayout({ children }) {
  return (
    <html lang="uk">
      <body className="bg-slate-950 text-slate-50 antialiased">
        <Navbar />
        <main className="min-h-screen p-6 sm:p-10">{children}</main>
      </body>
    </html>
  );
}
