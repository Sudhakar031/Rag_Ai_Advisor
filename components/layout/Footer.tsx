import Link from "next/link";
import { Sparkles, Heart } from "lucide-react";
import { Container } from "./Container";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const sections = [
    {
      title: "Product",
      links: [
        { name: "Compare Platforms", href: "/compare" },
        { name: "Our Methodology", href: "/compare/methodology" },
        { name: "Pricing Plans", href: "/pricing" },
        { name: "Book a Demo", href: "/contact" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Blog & Insights", href: "/blog" },
        { name: "Hiring Guidelines", href: "/blog/how-to-choose-between-assessment-platforms" },
        { name: "Pricing Transparency", href: "/blog/why-pricing-transparency-matters" },
        { name: "FAQ", href: "/compare" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/compare" },
        { name: "Contact", href: "/contact" },
        { name: "Privacy Policy", href: "/compare" },
        { name: "Terms of Service", href: "/compare" },
      ],
    },
  ];

  return (
    <footer className="border-t border-slate-200 bg-white py-16 md:py-20">
      <Container>
        <div className="grid gap-12 lg:grid-cols-4 md:grid-cols-2">
          {/* Brand Info */}
          <div className="flex flex-col gap-4">
            <Link href="/compare" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#00a6d6] to-[#35c78a] text-white shadow-sm">
                <Sparkles size={18} />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Hireko <span className="bg-gradient-to-r from-[#00a6d6] to-[#35c78a] bg-clip-text text-transparent">Compare</span>
              </span>
            </Link>
            <p className="text-sm leading-6 text-slate-500">
              Independent reviews and in-depth comparisons of leading AI hiring software, video interviewing platforms, and applicant tracking systems.
            </p>
          </div>

          {/* Links Sections */}
          {sections.map((section) => (
            <div key={section.title} className="flex flex-col gap-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-950">
                {section.title}
              </h3>
              <ul className="flex flex-col gap-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 hover:text-[#00a6d6] transition-colors duration-150"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 border-t border-slate-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>&copy; {currentYear} Hireko Compare. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart size={12} className="fill-[#35c78a] text-[#35c78a]" /> for modern recruiting teams.
          </p>
        </div>
      </Container>
    </footer>
  );
}
