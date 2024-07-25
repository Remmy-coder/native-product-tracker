"use client";

import React, { useEffect } from "react";

export default function Loading() {
  useEffect(() => {
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      import("ldrs").then((module) => {
        const grid = module.grid;
        grid.register();
      });
    }
  }, []);

  return (
    <div className="flex items-center justify-center w-full h-screen">
      <l-grid size="200" speed="1.5" color="white"></l-grid>
    </div>
  );
}
