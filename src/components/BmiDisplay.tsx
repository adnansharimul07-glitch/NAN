/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Info, Sparkles, ShieldAlert, HeartHandshake } from "lucide-react";

interface BmiDisplayProps {
  bmi: number;
  category: "Kurus" | "Normal" | "Gemuk" | "Obesitas" | "";
  weight: number;
  height: number;
}

export default function BmiDisplay({ bmi, category, weight, height }: BmiDisplayProps) {
  // Determine standard color accents
  const styleConfig = {
    Kurus: {
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-sky-500/30",
      barColor: "bg-sky-400",
      barPosition: "15%",
      label: "Kurus (Underweight)",
      advice: "Berat badan Anda kurang. Disarankan untuk meningkatkan porsi makan yang padat gizi, mengonsumsi protein berkualitas tinggi, serta melakukan latihan kekuatan fisik untuk melatih massa otot.",
    },
    Normal: {
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      barColor: "bg-emerald-400",
      barPosition: "45%",
      label: "Normal (Ideal)",
      advice: "Selamat! Berat badan Anda berada dalam kondisi sangat sehat & ideal. Pertahankan pola makan bergizi seimbang, cukup tidur, dan lakukan aktivitas fisik/olahraga secara rutin 150 menit per minggu.",
    },
    Gemuk: {
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      barColor: "bg-amber-400",
      barPosition: "72%",
      label: "Gemuk (Overweight)",
      advice: "Anda memiliki kecenderungan berat badan berlebih. Direkomendasikan untuk mulai membatasi makanan olahan tinggi kalori dan gula, mengontrol porsi makan, serta meningkatkan kuantitas olahraga kardiovaskular.",
    },
    Obesitas: {
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      border: "border-rose-500/30",
      barColor: "bg-rose-500",
      barPosition: "92%",
      label: "Obesitas (Obese)",
      advice: "Kondisi berat badan Anda berada di tingkat obesitas. Disarankan untuk berkonsultasi dengan ahli gizi, menjalankan terapi diet defisit kalori sehat terarah, dan melakukan olahraga ringan tanpa membebani persendian kaki berlebih.",
    },
    "": {
      color: "text-slate-400",
      bg: "bg-slate-800/20",
      border: "border-slate-800",
      barColor: "bg-slate-700",
      barPosition: "0%",
      label: "Belum Ada Pengukuran",
      advice: "Atur slider berat dan tinggi badan Anda di panel sebelah kiri lalu tekan tombol eksekusi untuk menghitung status indeks massa tubuh secara instan.",
    },
  }[category || ""];

  // Healthy weight range calculator (Using BMI 18.5 - 24.9 standard formulas for reference)
  const minHealthyWeight = Math.round((18.5 * (height / 100) ** 2));
  const maxHealthyWeight = Math.round((24.9 * (height / 100) ** 2));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-emerald-400" />
            Hasil Diagnosa BMI
          </h2>
          {category && (
            <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 font-mono px-2 py-0.5 rounded">
              H:{height}cm | W:{weight}kg
            </span>
          )}
        </div>

        {category ? (
          <div className="space-y-6">
            {/* Big Indicator Display */}
            <div className="text-center py-4 bg-slate-950 rounded-2xl border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-sky-400 to-rose-500"></div>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">Skor Indeks Massa Tubuh</p>
              <h3 className="text-5xl md:text-6xl font-extrabold font-mono tracking-tighter mt-1 text-white">
                {bmi}
                <span className="text-xs md:text-sm font-sans font-normal text-slate-400 ml-1">kg/m²</span>
              </h3>
              <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full font-sans text-xs font-semibold uppercase tracking-wider bg-slate-900 border border-slate-800">
                <span className={`w-2 h-2 rounded-full ${styleConfig.barColor}`}></span>
                <span className={styleConfig.color}>{styleConfig.label}</span>
              </div>
            </div>

            {/* Scale Visualizer */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400 font-mono">
                <span>Skala Pengukuran (Assembly):</span>
                <span className="text-white font-semibold">Hasil = {bmi}</span>
              </div>
              <div className="h-3.5 bg-slate-950 rounded-full w-full relative overflow-hidden border border-slate-800 p-0.5">
                {/* Visual blocks */}
                <div className="absolute left-0 top-0 h-full w-[35%] bg-sky-500/20" title="Kurus (< 18)"></div>
                <div className="absolute left-[35%] top-0 h-full w-[25%] bg-emerald-500/20" title="Normal (18 - 24)"></div>
                <div className="absolute left-[60%] top-0 h-full w-[15%] bg-amber-500/20" title="Gemuk (25 - 27)"></div>
                <div className="absolute left-[75%] top-0 h-full w-[25%] bg-rose-500/20" title="Obesitas (> 27)"></div>
                
                {/* Pointer marker */}
                <div 
                  className={`absolute top-0 h-full w-2.5 rounded-full ${styleConfig.barColor} border border-white shadow-md transition-all duration-700 ease-out`}
                  style={{ left: styleConfig.barPosition }}
                ></div>
              </div>
              <div className="flex justify-between text-[9px] text-slate-500 font-mono pt-1">
                <span className="text-sky-400">Kurus (&lt; 18)</span>
                <span className="text-emerald-400">Normal (18-24)</span>
                <span className="text-amber-400">Gemuk (25-27)</span>
                <span className="text-rose-500">Obesitas (&gt; 27)</span>
              </div>
            </div>

            {/* Advice and healthy weight suggestions */}
            <div className={`p-4 rounded-xl border ${styleConfig.bg} ${styleConfig.border} transition duration-500`}>
              <div className="flex gap-2.5">
                <Sparkles className={`w-5 h-5 flex-shrink-0 mt-0.5 ${styleConfig.color}`} />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-white">Rekomendasi Kesehatan</h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{styleConfig.advice}</p>
                </div>
              </div>
            </div>

            {/* Info Metrics Table */}
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2 text-xs font-sans">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/50">
                <span className="text-slate-400">Berat Ideal untuk Tinggi {height}cm</span>
                <span className="text-emerald-400 font-mono font-semibold">
                  {minHealthyWeight} kg - {maxHealthyWeight} kg
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/50">
                <span className="text-slate-400 font-sans">Rumus BMI Assembly 16-bit</span>
                <span className="text-slate-300 font-mono">
                  (Berat × 100) / (Tinggi² / 100)
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-400 flex items-center gap-1">
                  Akurasi Integer ASM
                  <span className="text-[9px] bg-slate-800 px-1 py-0.2 rounded text-amber-500 font-semibold">Bulat</span>
                </span>
                <span className="text-slate-300 font-mono">
                  Tanpa Desimal Koma
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="bg-slate-950 p-4 rounded-full border border-slate-800/80 text-slate-500">
              <Info className="w-10 h-10" />
            </div>
            <div className="max-w-xs space-y-1">
              <h3 className="text-sm font-semibold text-slate-300">Harap Masukkan Input Data</h3>
              <p className="text-xs text-slate-400 font-sans">
                Gunakan panel input untuk merumuskan tinggi & berat badan, lalu lakukan kompilasi simulasi atau eksekusi server.
              </p>
            </div>
          </div>
        )}
      </div>

      {category && (
        <div className="mt-5 pt-3 border-t border-slate-800/50 flex items-start gap-1 text-[11px] text-slate-500 font-mono leading-tight">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
          <span>
            *Klasifikasi BMI mengacu pada logika register 16-bit assembly DOS yang membulatkan bilangan pecahan ke bawah (integer division).
          </span>
        </div>
      )}
    </div>
  );
}
