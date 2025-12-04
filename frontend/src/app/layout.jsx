import "./globals.css";

export const metadata = {
  title: "Cimeika System UI",
  description: "Phase 1 system interface for monitoring and resonance analytics.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}
