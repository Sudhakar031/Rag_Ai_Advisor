import React from "react";
import Link from "next/link";

interface ButtonProps {
  href?: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
}: ButtonProps) {
  const isPrimary = variant === "primary";

  const baseClass =
    "inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-sm font-semibold transition-all duration-200 cursor-pointer select-none shadow-sm";

  const variantClass = isPrimary
    ? "bg-slate-900 !text-white hover:bg-slate-800 hover:shadow-md active:scale-98"
    : "border border-slate-300 bg-white !text-slate-900 hover:bg-slate-50 hover:border-slate-400 active:scale-98";

  const textColorStyle: React.CSSProperties = isPrimary
    ? { color: "#ffffff", backgroundColor: "#0f172a" }
    : { color: "#0f172a", backgroundColor: "#ffffff" };

  const innerSpan = (
    <span
      className={`font-semibold tracking-wide ${isPrimary ? "!text-white" : "!text-slate-900"}`}
      style={{ color: isPrimary ? "#ffffff" : "#0f172a" }}
    >
      {children}
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`${baseClass} ${variantClass} ${className}`}
        style={textColorStyle}
      >
        {innerSpan}
      </Link>
    );
  }

  return (
    <button
      className={`${baseClass} ${variantClass} ${className}`}
      style={textColorStyle}
    >
      {innerSpan}
    </button>
  );
}
