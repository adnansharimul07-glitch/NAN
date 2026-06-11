/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import Header from "./components/Header.jsx";
import BmiForm from "./components/BmiForm.jsx";
import BmiDisplay from "./components/BmiDisplay.jsx";
import AssemblyPanel from "./components/AssemblyPanel.jsx";
import { executeAssembly } from "./lib/assemblyEmulator.js";
import { Cpu, Terminal, Shield, Scale, Ruler, Sparkles, Server } from "lucide-react";

export default function App() {
  const [berat, setBerat] = useState<number>(63);
  const [tinggi, setTinggi] = useState<number>(170);
  const [bmi, setBmi] = useState<number>(21);
  const [category, setCategory] = useState<"Kurus" | "Normal" | "Gemuk" | "Obesitas" | "">("Normal");
  const [runKey, setRunKey] = useState<number>(0);
  const [visualizeMode, setVisualizeMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [apiIndicator, setApiIndicator] = useState<"not_started" | "backend" | "client_fallback" | "error">("backend");
  const [errorText, setErrorText] = useState<string | null>(null);

  // Trigger calculation
  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!berat || !tinggi) return;

    setLoading(true);
    setErrorText(null);

    // Bump run key to refresh Assembly panel
    setRunKey((p) => p + 1);

    try {
      // Primary Route: Execute in the Express backend
      const response = await fetch("/api/calculate-assembly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ berat, tinggi }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBmi(data.hasilBmi);
          setCategory(data.status);
          setApiIndicator("backend");
        } else {
          throw new Error(data.error || "Gagal mendapatkan hasil dari backend");
        }
      } else {
        throw new Error(`Server API returned status: ${response.status}`);
      }
    } catch (err: any) {
      console.warn("Express backend unavailable, using client-side assembly simulation:", err);
      // Fallback Route: Execute locally using our fully compliant integrated emulator
      try {
        const clientResult = executeAssembly(berat, tinggi);
        const finalBmi = clientResult.finalState.variables.hasil;
        
        let statusStr: "Kurus" | "Normal" | "Gemuk" | "Obesitas" = "Normal";
        if (finalBmi < 18) statusStr = "Kurus";
        else if (finalBmi <= 24) statusStr = "Normal";
        else if (finalBmi <= 27) statusStr = "Gemuk";
        else statusStr = "Obesitas";

        setBmi(finalBmi);
        setCategory(statusStr);
        setApiIndicator("client_fallback");
      } catch (fallbackErr: any) {
        setApiIndicator("error");
        setErrorText("Kegagalan kritis mesin emulator assembly.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setBerat(63);
    setTinggi(170);
    setBmi(21);
    setCategory("Normal");
    setRunKey((p) => p + 1);
    setErrorText(null);
    setApiIndicator("backend");
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-[#f8fafc] font-sans pb-16">
      {/* Sticky Top Header */}
      <Header />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-10 space-y-8">
        
        {/* Intro Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800/80 rounded-2xl p-6 md:p-8">
          <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/5 blur-3xl rounded-full"></div>
          <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-violet-500/5 blur-3xl rounded-full"></div>
          
          <div className="relative z-10 max-w-4xl space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-emerald-950/50 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-md text-xs font-mono">
              <Shield className="w-3.5 h-3.5" />
              Sistem Terverifikasi Mikroprosesor 16-Bit
            </div>
            <h2 className="text-2xl md:text-3.5xl font-extrabold tracking-tight text-white leading-tight">
              Akurasi Tinggi BMI Terkompilasi Kode <span className="text-emerald-400">Assembly Intel 8086</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-3xl font-sans">
              Kami menyatukan kecanggihan antarmuka web modern dengan keandalan instruksi tingkat rendah assembler. 
              Rumus BMI Anda diproses langsung menggunakan interupsi integer division (DIV) dan registers 16-bit, 
              menawarkan gambaran eksekusi perangkat keras yang transparan dan bebas <i>bloatware</i>.
            </p>
          </div>
        </div>

        {/* API execution status indicator banner */}
        {apiIndicator === "client_fallback" && (
          <div className="bg-amber-950/50 border border-amber-500/30 text-amber-200 p-4 rounded-xl flex items-center justify-between gap-4 text-xs font-mono">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              INFORMASI: Backend sedang offline/mempersiapkan server. Perhitungan dialihkan otomatis ke Web Assembly ROM lokal.
            </span>
            <span className="text-[10px] bg-amber-900/40 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
              CLIENT EMULATION ACTIVE
            </span>
          </div>
        )}

        {errorText && (
          <div className="bg-red-950/50 border border-red-500/30 text-red-200 p-4 rounded-xl text-xs font-mono">
            MASALAH SISTEM: {errorText}
          </div>
        )}

        {/* Two Columns Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Inputs Column */}
          <div className="md:col-span-5 h-full">
            <BmiForm
              berat={berat}
              setBerat={setBerat}
              tinggi={tinggi}
              setTinggi={setTinggi}
              onSubmit={handleCalculate}
              loading={loading}
              visualizeMode={visualizeMode}
              setVisualizeMode={setVisualizeMode}
              onReset={handleReset}
            />
          </div>

          {/* Display Result Column */}
          <div className="md:col-span-7 h-full">
            <BmiDisplay
              bmi={bmi}
              category={category}
              weight={berat}
              height={tinggi}
            />
          </div>
        </div>

        {/* Full-width interactive Assembly Engine panel */}
        {visualizeMode && (
          <div className="pt-4">
            <div className="flex items-center gap-2 mb-4">
              <Terminal className="w-5 h-5 text-violet-400" />
              <h3 className="font-bold text-lg text-white font-sans">Mesin Simulasi Langkah-demi-Langkah</h3>
              <span className="text-[10px] bg-violet-950 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-full font-mono">
                Debug Mode
              </span>
            </div>
            
            <AssemblyPanel
              berat={berat}
              tinggi={tinggi}
              runKey={runKey}
            />
          </div>
        )}

      </main>
    </div>
  );
}
