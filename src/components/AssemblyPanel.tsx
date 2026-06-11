/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Play, Pause, StepForward, RotateCcw, Monitor, 
  Binary, Code, Layers, FileCode, CheckCircle 
} from "lucide-react";
import { 
  CPUState, 
  AssemblyInstruction, 
  createInstructionList, 
  ORIGINAL_ASM_CODE, 
  formatRegisterHex,
  getHByte,
  getLByte,
  setHByte,
  setLByte
} from "../lib/assemblyEmulator.js";

interface AssemblyPanelProps {
  berat: number;
  tinggi: number;
  runKey: number; // Trigger simulation reset when inputs submit
}

export default function AssemblyPanel({ berat, tinggi, runKey }: AssemblyPanelProps) {
  const [instructions, setInstructions] = useState<AssemblyInstruction[]>([]);
  const [cpuState, setCpuState] = useState<CPUState | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(300); // 300ms per instruction
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // Initialize instruction pointer and CPU Registers
  const resetCPU = () => {
    setIsPlaying(false);
    const instrList = createInstructionList();
    setInstructions(instrList);

    const pad3 = (num: number) => num.toString().padStart(3, "0");
    const bStr = pad3(berat);
    const tStr = pad3(tinggi);
    const bufferChars = [...bStr.split(""), ...tStr.split("")];

    const initialState: CPUState = {
      ax: 0,
      bx: 0,
      cx: 0,
      dx: 0,
      ip: 0,
      sp: 0xfffe,
      stack: [],
      flags: { zf: true, sf: false, cf: false, of: false },
      variables: { berat: 0, tinggi: 0, hasil: 0, pembagi: 0, temp: 0 },
      inputBuffer: bufferChars,
      inputPointer: 0,
      consoleOutput: "",
      terminalLog: [],
      isTerminated: false,
      history: []
    };

    setCpuState(initialState);
  };

  // Reset core when weight/height parameters submits
  useEffect(() => {
    resetCPU();
  }, [runKey, berat, tinggi]);

  // Handle auto-scroll terminal output
  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [cpuState?.consoleOutput]);

  // Execute single instruction step
  const executeStep = () => {
    if (!cpuState || cpuState.isTerminated) {
      setIsPlaying(false);
      return;
    }

    setCpuState((prevState) => {
      if (!prevState || prevState.isTerminated) return prevState;

      // Copy state
      const nextState: CPUState = {
        ...prevState,
        stack: [...prevState.stack],
        flags: { ...prevState.flags },
        variables: { ...prevState.variables },
        inputBuffer: [...prevState.inputBuffer],
        terminalLog: [...prevState.terminalLog]
      };

      const currentInstr = instructions[nextState.ip];
      if (!currentInstr) {
        nextState.isTerminated = true;
        nextState.consoleOutput += "\n\n[DOS Program Finished]";
        return nextState;
      }

      const prevIp = nextState.ip;
      currentInstr.action(nextState);

      // Safe fallback increment if action did not modify IP
      if (nextState.ip === prevIp && !nextState.isTerminated) {
        nextState.ip++;
      }

      // Snapshot timeline history if needed
      return nextState;
    });
  };

  // Periodic Timer loop for play mode
  useEffect(() => {
    let timerId: any = null;
    if (isPlaying) {
      timerId = setInterval(() => {
        if (cpuState && !cpuState.isTerminated) {
          executeStep();
        } else {
          setIsPlaying(false);
        }
      }, speedMs);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isPlaying, cpuState?.ip, speedMs]);

  if (!cpuState) return null;

  const currentInstruction = instructions[cpuState.ip];

  // Map instruction index directly to actual string matches or line sequences in original ASM
  const asmLines = ORIGINAL_ASM_CODE.split("\n");

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Simulation Header controls */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 md:px-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Binary className="w-5 h-5 text-violet-400" />
          <h3 className="font-semibold text-white">Visualizer Register Mikroprosesor 8086</h3>
        </div>

        {/* Action controllers */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={cpuState.isTerminated}
            className={`p-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              cpuState.isTerminated 
                ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                : isPlaying 
                ? "bg-amber-600 text-white hover:bg-amber-500" 
                : "bg-violet-600 text-white hover:bg-violet-500 shadow-md shadow-violet-600/10"
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-violet-200 fill-current" />}
            {isPlaying ? "PAUSE" : "PLAY AUTO"}
          </button>

          <button
            onClick={executeStep}
            disabled={isPlaying || cpuState.isTerminated}
            className={`p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
              (isPlaying || cpuState.isTerminated) && "opacity-40 cursor-not-allowed"
            }`}
            title="Langkah Berikutnya (F7)"
          >
            <StepForward className="w-4 h-4" />
            STEP
          </button>

          <button
            onClick={resetCPU}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
            title="Muat Ulang Registrasi"
          >
            <RotateCcw className="w-4 h-4" />
            RESET
          </button>

          <div className="hidden xs:flex items-center gap-2 ml-2 border-l border-slate-800 pl-3">
            <span className="text-[11px] text-slate-400 font-mono">Detak:</span>
            <select
              value={speedMs}
              onChange={(e) => setSpeedMs(parseInt(e.target.value))}
              className="bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-xs rounded p-1 focus:outline-none"
            >
              <option value={1000}>Lambat (1s)</option>
              <option value={500}>Sedang (0.5s)</option>
              <option value={300}>Cepat (0.3s)</option>
              <option value={100}>Sangat Cepat (0.1s)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-slate-800">
        {/* LEFT COLUMN: Monitors + Registers (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 p-4 md:p-5 space-y-5">
          {/* DOS Terminal Monitor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 font-mono">
                <Monitor className="w-3.5 h-3.5 text-slate-400" />
                COM1:\DOSBOX\BMI.EXE (Monitor CRT)
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded font-mono border border-emerald-900/30">
                SCREEN MODE: TEXT CO80
              </span>
            </div>
            
            {/* Dark Retro Console screen */}
            <div className="bg-black border border-slate-800 rounded-xl p-4 font-mono text-xs text-green-500 shadow-inner h-40 overflow-y-auto flex flex-col justify-between select-none">
              <div className="space-y-1.5 whitespace-pre">
                <span className="text-slate-600 block text-[10px] pb-1 border-b border-slate-900">
                  Microsoft(R) MS-DOS(R) Versi 6.22<br />
                  (C)Copyright Microsoft Corp 1981-1994.
                </span>
                <span className="block text-slate-400">A:\&gt; bmi.exe</span>
                
                {cpuState.consoleOutput}
                
                {!cpuState.isTerminated && (
                  <span className="inline-block w-2 h-4 bg-green-500 terminal-cursor ml-0.5 align-middle"></span>
                )}
                <div ref={terminalBottomRef}></div>
              </div>
            </div>
          </div>

          {/* Interactive register boxes */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 font-mono">
              <Binary className="w-3.5 h-3.5 text-violet-400" />
              INTEGRITAS REKOR REGISTER CPU 8086
            </span>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              {/* AX Register */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 relative overflow-hidden">
                <div className="absolute top-2 right-2 text-[10px] text-violet-500/80 font-bold">AKUMULATOR (AX)</div>
                <div className="text-slate-500 text-[10px] mb-1">AX: <span className="text-white font-bold">{formatRegisterHex(cpuState.ax)}</span></div>
                {/* Visual splits of AH / AL */}
                <div className="grid grid-cols-2 gap-1 text-center font-bold mt-1.5">
                  <div className="bg-slate-900 border border-slate-800 rounded p-1.5">
                    <div className="text-[8px] text-slate-550 uppercase">AH (09H)</div>
                    <div className="text-amber-400 text-xs mt-0.5">0x{getHByte(cpuState.ax).toString(16).toUpperCase().padStart(2, "0")}</div>
                    <div className="text-[9px] text-slate-500 font-normal">{getHByte(cpuState.ax)}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded p-1.5">
                    <div className="text-[8px] text-slate-550 uppercase">AL (30H)</div>
                    <div className="text-sky-400 text-xs mt-0.5">0x{getLByte(cpuState.ax).toString(16).toUpperCase().padStart(2, "0")}</div>
                    <div className="text-[9px] text-slate-500 font-normal">{getLByte(cpuState.ax)}</div>
                  </div>
                </div>
              </div>

              {/* BX Register */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 relative overflow-hidden">
                <div className="absolute top-2 right-2 text-[10px] text-violet-500/80 font-bold">INDЕKS BASIS (BX)</div>
                <div className="text-slate-500 text-[10px] mb-1">BX: <span className="text-white font-bold">{formatRegisterHex(cpuState.bx)}</span></div>
                <div className="grid grid-cols-2 gap-1 text-center font-bold mt-1.5">
                  <div className="bg-slate-900 border border-slate-800 rounded p-1.5">
                    <div className="text-[8px] text-slate-550">BH</div>
                    <div className="text-amber-400 text-xs mt-0.5">0x{getHByte(cpuState.bx).toString(16).toUpperCase().padStart(2, "0")}</div>
                    <div className="text-[9px] text-slate-500 font-normal">{getHByte(cpuState.bx)}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded p-1.5">
                    <div className="text-[8px] text-slate-550">BL</div>
                    <div className="text-sky-400 text-xs mt-0.5">0x{getLByte(cpuState.bx).toString(16).toUpperCase().padStart(2, "0")}</div>
                    <div className="text-[9px] text-slate-500 font-normal">{getLByte(cpuState.bx)}</div>
                  </div>
                </div>
              </div>

              {/* CX Register */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 relative overflow-hidden">
                <div className="absolute top-2 right-2 text-[10px] text-violet-500/80 font-bold">PENCACAH LOOP (CX)</div>
                <div className="text-slate-500 text-[10px] mb-1">CX: <span className="text-white font-bold">{formatRegisterHex(cpuState.cx)}</span></div>
                <div className="grid grid-cols-2 gap-1 text-center font-bold mt-1.5">
                  <div className="bg-slate-900 border border-slate-800 rounded p-1.5">
                    <div className="text-[8px] text-slate-550">CH</div>
                    <div className="text-amber-400 text-xs mt-0.5">0x{getHByte(cpuState.cx).toString(16).toUpperCase().padStart(2, "0")}</div>
                    <div className="text-[9px] text-slate-500 font-normal">{getHByte(cpuState.cx)}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded p-1.5">
                    <div className="text-[8px] text-slate-550">CL</div>
                    <div className="text-sky-400 text-xs mt-0.5">0x{getLByte(cpuState.cx).toString(16).toUpperCase().padStart(2, "0")}</div>
                    <div className="text-[9px] text-slate-500 font-normal">{getLByte(cpuState.cx)}</div>
                  </div>
                </div>
              </div>

              {/* DX Register */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 relative overflow-hidden">
                <div className="absolute top-2 right-2 text-[10px] text-violet-500/80 font-bold">SEGMENT DATA (DX)</div>
                <div className="text-slate-500 text-[10px] mb-1">DX: <span className="text-white font-bold">{formatRegisterHex(cpuState.dx)}</span></div>
                <div className="grid grid-cols-2 gap-1 text-center font-bold mt-1.5">
                  <div className="bg-slate-900 border border-slate-800 rounded p-1.5">
                    <div className="text-[8px] text-slate-550">DH</div>
                    <div className="text-amber-400 text-xs mt-0.5">0x{getHByte(cpuState.dx).toString(16).toUpperCase().padStart(2, "0")}</div>
                    <div className="text-[9px] text-slate-500 font-normal">{getHByte(cpuState.dx)}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded p-1.5">
                    <div className="text-[8px] text-slate-550">DL</div>
                    <div className="text-sky-400 text-xs mt-0.5">0x{getLByte(cpuState.dx).toString(16).toUpperCase().padStart(2, "0")}</div>
                    <div className="text-[9px] text-slate-500 font-normal">{getLByte(cpuState.dx)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Control Registers + Flags Segment */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              {/* Internal Pointers */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1.5">
                <span className="text-[10px] text-slate-400">Pointers:</span>
                <div className="flex justify-between items-center bg-slate-900 px-2.5 py-1 rounded">
                  <span className="text-[10px] text-slate-500">IP (Instr):</span>
                  <span className="text-sky-400 font-bold">0x{cpuState.ip.toString(16).toUpperCase().padStart(4, "0")}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900 px-2.5 py-1 rounded">
                  <span className="text-[10px] text-slate-500">SP (Stack):</span>
                  <span className="text-teal-400 font-bold">0x{cpuState.sp.toString(16).toUpperCase().padStart(4, "0")}</span>
                </div>
              </div>

              {/* Flag Segment */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                <span className="text-[10px] text-slate-400 block">Status Flags:</span>
                <div className="flex gap-3 justify-center">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[8px] text-slate-500">ZF (Zero)</span>
                    <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[8px] font-bold ${
                      cpuState.flags.zf ? "bg-emerald-500/20 text-emerald-400 border-emerald-400 animate-pulse" : "bg-slate-900 text-slate-600 border-slate-800"
                    }`}>
                      {cpuState.flags.zf ? "1" : "0"}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[8px] text-slate-500">SF (Sign)</span>
                    <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[8px] font-bold ${
                      cpuState.flags.sf ? "bg-amber-500/20 text-amber-400 border-amber-400 animate-pulse" : "bg-slate-900 text-slate-600 border-slate-800"
                    }`}>
                      {cpuState.flags.sf ? "1" : "0"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Memory DW Variables segment */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 block mb-1">DATA SEGMENT VARIABLES:</span>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] bg-slate-900 p-1.5 rounded">
                  <div>
                    <span className="text-slate-500">Berat:</span>{" "}
                    <span className="text-emerald-400 font-semibold">{cpuState.variables.berat}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Tinggi:</span>{" "}
                    <span className="text-sky-400 font-semibold">{cpuState.variables.tinggi}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Pembagi:</span>{" "}
                    <span className="text-amber-500 font-semibold">{cpuState.variables.pembagi}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Hasil:</span>{" "}
                    <span className="text-white font-semibold">{cpuState.variables.hasil}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stack Visualizer */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] text-slate-400 flex items-center gap-1 mb-2 font-mono">
                <Layers className="w-3 h-3 text-teal-400" />
                VISUAL Tumpukan MEMORI (STACK REGISTER)
              </span>
              <div className="flex gap-2 items-center overflow-x-auto py-1 min-h-[36px]">
                {cpuState.stack.length === 0 ? (
                  <span className="text-[10px] text-slate-600 font-mono italic">Stack dalam keadaan kosong</span>
                ) : (
                  cpuState.stack.map((item, idx) => (
                    <div key={idx} className="bg-slate-900 border border-teal-500/30 text-teal-400 rounded px-2 py-1 font-mono text-[10px] flex-shrink-0 flex items-center gap-1 shadow-sm">
                      <span className="text-[8px] text-slate-500">[{idx}]:</span>
                      <span>0x{item.toString(16).toUpperCase().padStart(4, "0")}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Assembly Code highlighting (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-950 flex flex-col h-[524px]">
          {/* File header title */}
          <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 font-mono">
              <FileCode className="w-3.5 h-3.5 text-emerald-400" />
              BMI.ASM (Kode Assembly Intel 8086)
            </span>
            <span className="text-[9px] bg-emerald-950/40 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-900/30">
              Active: IP {cpuState.ip}
            </span>
          </div>

          {/* Assembly list viewport */}
          <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-0.5 scrollbar-thin select-none">
            {asmLines.map((lineText, lineIdx) => {
              // Check if currently executing instruction pointer maps to this line index
              // Note: our ASM instruction models hold `sourceLine` which are 1-based indices
              const isActive = currentInstruction && currentInstruction.sourceLine === (lineIdx + 1);

              return (
                <div 
                  key={lineIdx} 
                  className={`group flex items-start gap-2.5 px-3 py-1 rounded transition duration-150 ${
                    isActive 
                      ? "bg-violet-950/80 border-l-[3px] border-violet-500 text-white shadow-lg shadow-violet-950/20" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                  }`}
                >
                  <span className={`w-6 text-right text-[10px] select-none ${isActive ? "text-violet-400 font-extrabold" : "text-slate-650"}`}>
                    {(lineIdx + 1).toString().padStart(3, "0")}
                  </span>
                  
                  {/* Arrow marker */}
                  <span className={`w-2.5 text-[10px] select-none font-bold ${isActive ? "text-violet-400 animate-pulse" : "text-transparent"}`}>
                    ➔
                  </span>
                  
                  {/* Program Line Code text */}
                  <span className={`flex-1 break-all ${isActive ? "font-bold text-violet-100" : ""}`}>
                    {lineText}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Current Instruction explanation box */}
          <div className="bg-slate-900 border-t border-slate-850 p-4 min-h-[90px] flex flex-col justify-center">
            {currentInstruction ? (
              <div className="space-y-1 text-slate-300">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-violet-400 bg-violet-950/40 px-2 py-0.5 rounded border border-violet-900/30">
                    Siklus Aktif
                  </span>
                  <span className="font-mono text-emerald-400 font-semibold">{currentInstruction.mnemonic}</span>
                </div>
                <p className="text-[11px] font-sans text-slate-300 leading-relaxed">
                  {currentInstruction.description}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 text-xs text-slate-500 py-2">
                <CheckCircle className="w-6 h-6 text-emerald-500 animate-bounce" />
                <span className="font-sans font-medium text-slate-300">Program Berhasil Dieksekusi</span>
                <span className="font-sans text-[10px] text-slate-400 text-center">Seluruh alur register CPU x86 selesai dengan interupsi INT 20H.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
