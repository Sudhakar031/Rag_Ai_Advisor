"use client";

import { useEffect } from "react";

export function useScroll() {
  useEffect(() => {
    const onScroll = () => {};
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
}
