/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Cpu, Scale, Activity } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 py-4 md:py-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/20 blur-md rounded-lg"></div>
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 rounded-lg border border-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/10">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white font-sans">
                Kalkulator BMI <span className="text-emerald-400">Assembly</span>
              </h1>
              <span className="text-[10px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded-full font-mono border border-emerald-500/20">
                16-bit / 8086
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Optimasi BMI dengan Pemrosesan Mikroprosesor Klasik Intel 8086
            </p>
          </div>
        </div>

        {/* Live Status Indicators */}
        <div className="flex items-center gap-6 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
            <span className="text-slate-300">Backend:</span>
            <span className="text-emerald-400 font-bold">EXPRESS LIVE</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-300">Mode:</span>
            <span className="text-sky-400 font-bold">X86-REAL-MODE</span>
          </div>
        </div>
      </div>
    </header>
  );
}
