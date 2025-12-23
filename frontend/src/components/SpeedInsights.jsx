"use client";

import { useEffect } from "react";

export default function SpeedInsights() {
  useEffect(() => {
    import("@vercel/speed-insights/next").then(({ injectSpeedInsights }) => {
      injectSpeedInsights();
    });
  }, []);

  return null;
}
