/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Scale, Ruler, Zap, RotateCcw } from "lucide-react";

interface BmiFormProps {
  berat: number;
  setBerat: (b: number) => void;
  tinggi: number;
  setTinggi: (t: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  visualizeMode: boolean;
  setVisualizeMode: (v: boolean) => void;
  onReset: () => void;
}

export default function BmiForm({
  berat,
  setBerat,
  tinggi,
  setTinggi,
  onSubmit,
  loading,
  visualizeMode,
  setVisualizeMode,
  onReset,
}: BmiFormProps) {
  // Presets based on standard Indonesian body characteristics and ideal models
  const presets = [
    { label: "Pria Indo (62kg, 166cm)", berat: 62, tinggi: 166 },
    { label: "Wanita Indo (52kg, 155cm)", berat: 52, tinggi: 155 },
    { label: "Ideal (65kg, 172cm)", berat: 65, tinggi: 172 },
    { label: "Obesitas (88kg, 162cm)", berat: 88, tinggi: 162 },
  ];

  const handleApplyPreset = (p: { berat: number; tinggi: number }) => {
    setBerat(p.berat);
    setTinggi(p.tinggi);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Scale className="w-5 h-5 text-emerald-400" />
          Parameter Pengukuran
        </h2>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 font-mono"
          title="Reset Input"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          RESET
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Berat Badan Input */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-emerald-400/80" />
              Berat Badan (kg)
            </label>
            <span className="text-lg font-bold font-mono text-emerald-400">
              {berat.toString().padStart(3, "0")} <span className="text-xs text-slate-500">kg</span>
            </span>
          </div>
          
          <input
            type="range"
            min="30"
            max="180"
            value={berat}
            onChange={(e) => setBerat(parseInt(e.target.value) || 30)}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1 px-1">
            <span>30 kg</span>
            <span>80 kg</span>
            <span>130 kg</span>
            <span>180 kg</span>
          </div>

          <div className="mt-2.5 flex gap-2">
            <input
              type="number"
              min="30"
              max="180"
              value={berat || ""}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setBerat(isNaN(val) ? 0 : Math.min(180, Math.max(0, val)));
              }}
              className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg text-sm font-mono text-center focus:outline-none focus:border-emerald-500 transition"
              placeholder="Jumlah berat (cth: 63)"
            />
          </div>
        </div>

        {/* Tinggi Badan Input */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
              <Ruler className="w-4 h-4 text-sky-400/80" />
              Tinggi Badan (cm)
            </label>
            <span className="text-lg font-bold font-mono text-sky-400">
              {tinggi.toString().padStart(3, "0")} <span className="text-xs text-slate-500">cm</span>
            </span>
          </div>
          
          <input
            type="range"
            min="100"
            max="220"
            value={tinggi}
            onChange={(e) => setTinggi(parseInt(e.target.value) || 100)}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1 px-1">
            <span>100 cm</span>
            <span>140 cm</span>
            <span>180 cm</span>
            <span>220 cm</span>
          </div>

          <div className="mt-2.5 flex gap-2">
            <input
              type="number"
              min="100"
              max="220"
              value={tinggi || ""}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setTinggi(isNaN(val) ? 0 : Math.min(220, Math.max(0, val)));
              }}
              className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg text-sm font-mono text-center focus:outline-none focus:border-sky-500 transition"
              placeholder="Jumlah tinggi (cth: 170)"
            />
          </div>
        </div>

        {/* Shortcuts Presets */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Preset Karakteristik</span>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((preset, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="text-[11px] text-left text-slate-300 bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 transition rounded-lg p-2 flex flex-col justify-center gap-0.5"
              >
                <span className="font-medium text-white truncate">{preset.label}</span>
                <span className="text-[10px] font-mono text-slate-500">
                  W:{preset.berat}kg | H:{preset.tinggi}cm
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Mode selection for visuals */}
        <div className="pt-2 border-t border-slate-800 space-y-3">
          <span className="text-xs font-semibold text-slate-400">Metode Eksekusi</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setVisualizeMode(false)}
              className={`p-2.5 rounded-xl border text-xs text-center transition flex flex-col items-center gap-1 font-sans ${
                !visualizeMode
                  ? "bg-emerald-500/10 border-emerald-500 text-white font-medium"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <span className="font-semibold text-emerald-400">Seketika / Instan</span>
              <span className="text-[10px] text-slate-500">Sekali Klik Server API</span>
            </button>
            <button
              type="button"
              onClick={() => setVisualizeMode(true)}
              className={`p-2.5 rounded-xl border text-xs text-center transition flex flex-col items-center gap-1 font-sans ${
                visualizeMode
                  ? "bg-violet-500/10 border-violet-500 text-white font-medium"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <span className="font-semibold text-violet-400">Simulasi CPU 8086</span>
              <span className="text-[10px] text-slate-500">Step-by-Step Register</span>
            </button>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading || !berat || !tinggi}
          className={`w-full py-3.5 px-4 rounded-xl font-medium tracking-wide shadow-lg transition duration-200 flex items-center justify-center gap-2 text-sm text-center ${
            loading || !berat || !tinggi
              ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
              : visualizeMode
              ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border border-violet-400 text-white shadow-violet-500/10 hover:shadow-violet-500/20"
              : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 border border-emerald-400 text-slate-950 font-bold shadow-emerald-500/10"
          }`}
        >
          <Zap className="w-4 h-4 fill-current" />
          {visualizeMode ? "MULAI SIMULASI INTERNAL" : "EKSEKUSI BMI (DI BACKEND)"}
        </button>
      </form>
    </div>
  );
}
