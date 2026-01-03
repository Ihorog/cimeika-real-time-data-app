"use client";
import Link from "next/link";

const menu = [
  { name: "Головна", href: "/" },
  { name: "Ci", href: "/ci" },
  { name: "ПоДія", href: "/podia" },
  { name: "Настрій", href: "/mood" },
  { name: "Маля", href: "/malya" },
  { name: "Казкар", href: "/kazkar" },
  { name: "Календар", href: "/calendar" },
  { name: "Галерея", href: "/gallery" },
];

export default function Navbar() {
  return (
    <nav className="w-full bg-slate-900 text-white px-6 py-3 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-cyan-400">Cimeika</span>
      </div>
      <ul className="flex gap-5 text-sm sm:text-base">
        {menu.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="hover:text-cyan-400 transition-colors">
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
