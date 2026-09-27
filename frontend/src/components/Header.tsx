"use client";

import React from "react";
import { ShieldCheck, Activity } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-lg tracking-tight">TrueScan</span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                Authenticity & Deepfake Analysis
              </span>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Engine Online</span>
        </div>
      </div>
    </header>
  );
}
