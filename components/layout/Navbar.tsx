"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";
import { Container } from "./Container";
import Logo from '../../public/image.png'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: "Comparisons", href: "/compare" },
    { name: "Methodology", href: "/compare/methodology" },
    { name: "Pricing", href: "/pricing" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ];

  const isActive = (path: string) => {
    if (path === "/compare" && pathname.startsWith("/compare")) {
      return pathname !== "/compare/methodology";
    }
    return pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <Container>
        <div className="flex h-20 items-center justify-between">

          {/* Logo */}
          <Link
            href="/compare"
            className="flex items-center transition-transform duration-300 hover:scale-105"
          >
            <Image
              src={Logo}
              alt="Hireko.ai"
              width={190}
              // height={52}
              priority
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-semibold transition-colors duration-200 ${
                  isActive(item.href)
                    ? "text-[#00A6D6]"
                    : "text-slate-600 hover:text-[#00A6D6]"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00A6D6] to-[#35C78A] px-5 py-2.5 text-sm font-semibold !text-white transition hover:shadow-lg shadow-sm"
              style={{ color: "#ffffff" }}
            >
              <span className="!text-white font-semibold" style={{ color: "#ffffff" }}>Book a Demo</span>
              <ArrowRight size={16} className="text-white" />
            </Link>
          </div>

          {/* Mobile Menu */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden rounded-lg p-2 text-slate-700"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

        </div>
      </Container>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="border-t bg-white md:hidden">
          <div className="space-y-2 px-6 py-6">

            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`block rounded-lg px-4 py-3 text-base font-semibold ${
                  isActive(item.href)
                    ? "bg-slate-100 text-[#00A6D6]"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {item.name}
              </Link>
            ))}

            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00A6D6] to-[#35C78A] py-3 font-semibold !text-white shadow-sm"
              style={{ color: "#ffffff" }}
            >
              <span className="!text-white font-semibold" style={{ color: "#ffffff" }}>Book a Demo</span>
              <ArrowRight size={16} className="text-white" />
            </Link>

          </div>
        </div>
      )}
    </header>
  );
}