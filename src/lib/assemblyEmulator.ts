/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// 16-bit 8086 Assembly CPU state representation
export interface CPUState {
  ax: number; // 16-bit register
  bx: number; // 16-bit register
  cx: number; // 16-bit register
  dx: number; // 16-bit register
  ip: number; // Instruction Pointer (internal index of instructions)
  sp: number; // Stack Pointer
  stack: number[]; // Stack values
  flags: {
    zf: boolean; // Zero flag
    sf: boolean; // Sign flag
    cf: boolean; // Carry flag
    of: boolean; // Overflow flag
  };
  variables: {
    berat: number;
    tinggi: number;
    hasil: number;
    pembagi: number;
    temp: number;
  };
  inputBuffer: string[]; // Mock keyboard inputs, e.g. ['0', '6', '3', '1', '7', '0']
  inputPointer: number;
  consoleOutput: string; // Captured standard outputs
  terminalLog: string[]; // List of historical visual prints
  isTerminated: boolean;
  history: CPUStateSnapshot[]; // Chronology of states for step-by-step timeline scrubbing
}

export interface CPUStateSnapshot {
  ip: number;
  ax: string;
  bx: string;
  cx: string;
  dx: string;
  sp: number;
  flags: string;
  consoleOutput: string;
  currentInstructionDesc: string;
  variables: {
    berat: number;
    tinggi: number;
    hasil: number;
    pembagi: number;
    temp: number;
  };
}

// Instruction schema for visual representation
export interface AssemblyInstruction {
  mnemonic: string;
  sourceLine: number; // Corresponds 1-to-1 to line in public text
  description: string;
  action: (state: CPUState) => void;
}

// Convert register views
export function getLByte(val: number): number {
  return val & 0xff;
}

export function getHByte(val: number): number {
  return (val >> 8) & 0xff;
}

export function setLByte(val: number, byteVal: number): number {
  return (val & 0xff00) | (byteVal & 0xff);
}

export function setHByte(val: number, byteVal: number): number {
  return (val & 0x00ff) | ((byteVal & 0xff) << 8);
}

// String representations for logs
export function formatRegisterHex(val: number): string {
  return "0x" + val.toString(16).toUpperCase().padStart(4, "0");
}

export const ORIGINAL_ASM_CODE = `.MODEL SMALL 
ORG 100H 
JMP START 
Judul DB 10,13,'HITUNG BMI SEDERHANA$' 
InputBeratTxt DB 10,13,'Masukkan berat badan. Contoh: 063',10,13,'$' 
InputTinggiTxt DB 10,13,'Masukkan tinggi badan. Contoh: 170',10,13,'$' 
HasilTxt DB 10,13,'BMI Anda = $' 
StatusTxt DB 10,13,'Status = $' 
BMIUnitTxt DB ' kg/m2$' 
KurusTxt DB 'Kurus$' 
NormalTxt DB 'Normal$' 
GemukTxt DB 'Gemuk$' 
ObesTxt DB 'Obesitas$' 
Berat DW 0 
Tinggi DW 0 
Hasil DW 0 
Pembagi DW 0 
Temp DW 0 
START:
  LEA DX,Judul 
  MOV AH,09H 
  INT 21H 
  LEA DX,InputBeratTxt 
  MOV AH,09H 
  INT 21H 
  CALL BacaTigaDigit 
  MOV Berat,AX 
  LEA DX,InputTinggiTxt 
  MOV AH,09H 
  INT 21H 
  CALL BacaTigaDigit 
  MOV Tinggi,AX 
  MOV AX,Tinggi ;ini rumus bminya yaw 
  MOV BX,Tinggi 
  MUL BX 
  MOV BX,100 
  DIV BX 
  MOV Pembagi,AX 
  MOV AX,Berat 
  MOV BX,100 
  MUL BX 
  MOV BX,Pembagi 
  DIV BX 
  MOV Hasil,AX 
  LEA DX,HasilTxt ;buat nyetak hasil 
  MOV AH,09H 
  INT 21H 
  MOV AX,Hasil 
  CALL CetakAngka 
  LEA DX,BMIUnitTxt 
  MOV AH,09H 
  INT 21H 
  LEA DX,StatusTxt ;ini tuh buat status BMI 
  MOV AH,09H 
  INT 21H 
  MOV AX,Hasil 
  CMP AX,18 
  JL BMIKurus 
  CMP AX,24 
  JG CekGemuk 
  LEA DX,NormalTxt 
  JMP CetakStatus 
CekGemuk: 
  CMP AX,27 
  JG BMIObes 
  LEA DX,GemukTxt 
  JMP CetakStatus 
BMIKurus: 
  LEA DX,KurusTxt 
  JMP CetakStatus 
BMIObes: 
  LEA DX,ObesTxt 
CetakStatus: 
  MOV AH,09H 
  INT 21H 
  INT 20H ;keluar dos 
  INT 21H 

BacaTigaDigit: ;Bagian proses data input 
  MOV Temp,0 
  MOV AH,01H ; digit 1 
  INT 21H 
  SUB AL,30H 
  MOV AH,0 
  MOV BX,100 
  MUL BX 
  MOV Temp,AX 
  MOV AH,01H ; digit 2 
  INT 21H 
  SUB AL,30H 
  MOV AH,0 
  MOV BX,10 
  MUL BX 
  ADD Temp,AX 
  MOV AH,01H ; digit 3 
  INT 21H 
  SUB AL,30H 
  MOV AH,0 
  ADD AX,Temp 
  RET 

CetakAngka: 
  CMP AX,0 
  JNE UbahAngka 
  MOV DL,'0' 
  MOV AH,02H 
  INT 21H 
  RET 
UbahAngka: 
  MOV CX,0 
  MOV BX,10 
AmbilDigit: 
  MOV DX,0 
  DIV BX 
  PUSH DX 
  INC CX 
  CMP AX,0 
  JNE AmbilDigit 
CetakDigit: 
  POP DX 
  ADD DL,30H 
  MOV AH,02H 
  INT 21H 
  LOOP CetakDigit 
  RET  
END START`;

// Generates instructions stream representing the execution logic of the program.
export function createInstructionList(): AssemblyInstruction[] {
  const instructions: AssemblyInstruction[] = [];

  // Labels offsets in instructions array
  let labelOffsets: { [key: string]: number } = {};

  const addInstr = (
    mnemonic: string,
    sourceLine: number,
    description: string,
    action: (state: CPUState) => void,
    label?: string
  ) => {
    const index = instructions.length;
    if (label) {
      labelOffsets[label] = index;
    }
    instructions.push({ mnemonic, sourceLine, description, action });
  };

  // Label helpers
  const getLabelIndex = (label: string): number => {
    const idx = labelOffsets[label];
    if (idx === undefined) {
      throw new Error(`Label not found: ${label}`);
    }
    return idx;
  };

  // --- START OF INSTRUCTIONS DEFINITION ---
  // START is labels offset index helper, defined below after defining positions

  // Program starts with an implicit ORG 100H and JMP START
  addInstr("JMP START", 3, "Lompat langsung ke label utama START", (state) => {
    state.ip = getLabelIndex("START");
  }, "JMP_START");

  // Main code block start
  addInstr("LEA DX, Judul", 21, "Memuat alamat offset variabel 'Judul' ke register DX", (state) => {
    state.dx = 0x1000; // Mock address pointing to "Judul"
  }, "START");

  addInstr("MOV AH, 09H", 22, "Menyetel layanan DOS 09H (mencetak string) di AH", (state) => {
    state.ax = setHByte(state.ax, 0x09);
  });

  addInstr("INT 21H", 23, "Memanggil interupsi DOS 21H untuk mencetak 'HITUNG BMI SEDERHANA'", (state) => {
    const ah = getHByte(state.ax);
    if (ah === 0x09) {
      state.consoleOutput += "\nHITUNG BMI SEDERHANA";
      state.terminalLog.push("stdout: HITUNG BMI SEDERHANA");
    }
    state.ip++;
  });

  addInstr("LEA DX, InputBeratTxt", 24, "Memuat alamat offset variabel perintah input Berat ke DX", (state) => {
    state.dx = 0x1010; // Mock address
  });

  addInstr("MOV AH, 09H", 25, "Menyetel layanan DOS 09H di AH", (state) => {
    state.ax = setHByte(state.ax, 0x09);
  });

  addInstr("INT 21H", 26, "Memanggil interupsi DOS 21H untuk mencetak prompt Berat badan", (state) => {
    const ah = getHByte(state.ax);
    if (ah === 0x09) {
      state.consoleOutput += "\nMasukkan berat badan. Contoh: 063\n";
      state.terminalLog.push("stdout: Masukkan berat badan. Contoh: 063");
    }
    state.ip++;
  });

  addInstr("CALL BacaTigaDigit", 27, "Memanggil subrutin 'BacaTigaDigit' untuk membaca input berat", (state) => {
    state.stack.push(state.ip + 1); // Push return address
    state.sp -= 2;
    state.ip = getLabelIndex("BacaTigaDigit");
  });

  addInstr("MOV Berat, AX", 28, "Menyimpan nilai register AX (input berat) ke variabel memori 'Berat'", (state) => {
    state.variables.berat = state.ax;
    state.ip++;
  });

  addInstr("LEA DX, InputTinggiTxt", 29, "Memuat alamat offset variabel perintah input Tinggi ke DX", (state) => {
    state.dx = 0x1020;
  });

  addInstr("MOV AH, 09H", 30, "Menyetel layanan DOS 09H di AH", (state) => {
    state.ax = setHByte(state.ax, 0x09);
  });

  addInstr("INT 21H", 31, "Memanggil interupsi DOS 21H untuk mencetak prompt Tinggi badan", (state) => {
    if (getHByte(state.ax) === 0x09) {
      state.consoleOutput += "\nMasukkan tinggi badan. Contoh: 170\n";
      state.terminalLog.push("stdout: Masukkan tinggi badan. Contoh: 170");
    }
    state.ip++;
  });

  addInstr("CALL BacaTigaDigit", 32, "Memanggil subrutin 'BacaTigaDigit' untuk membaca input tinggi", (state) => {
    state.stack.push(state.ip + 1);
    state.sp -= 2;
    state.ip = getLabelIndex("BacaTigaDigit");
  });

  addInstr("MOV Tinggi, AX", 33, "Menyimpan nilai register AX (input tinggi) ke variabel memori 'Tinggi'", (state) => {
    state.variables.tinggi = state.ax;
    state.ip++;
  });

  // --- Rumus BMI Dimulai ---
  addInstr("MOV AX, Tinggi", 34, "Memuat nilai variabel 'Tinggi' ke register AX", (state) => {
    state.ax = state.variables.tinggi;
    state.ip++;
  });

  addInstr("MOV BX, Tinggi", 35, "Memuat nilai variabel 'Tinggi' ke register BX", (state) => {
    state.bx = state.variables.tinggi;
    state.ip++;
  });

  addInstr("MUL BX", 36, "Mengalikan AX dengan BX (Tinggi * Tinggi), hasil disimpan di DX:AX", (state) => {
    const res = state.ax * state.bx;
    state.ax = res & 0xffff;
    state.dx = (res >> 16) & 0xffff;
    state.ip++;
  });

  addInstr("MOV BX, 100", 37, "Memuat nilai pembagi 100 ke register BX", (state) => {
    state.bx = 100;
    state.ip++;
  });

  addInstr("DIV BX", 38, "Membagi DX:AX dengan BX (100) untuk konversi skala, hasil di AX", (state) => {
    const num = (state.dx << 16) | state.ax;
    state.ax = Math.floor(num / state.bx) & 0xffff;
    state.dx = (num % state.bx) & 0xffff; // Sisa bagi di DX
    state.ip++;
  });

  addInstr("MOV Pembagi, AX", 39, "Menyimpan hasil kuadrat tinggi/100 ke variabel 'Pembagi'", (state) => {
    state.variables.pembagi = state.ax;
    state.ip++;
  });

  addInstr("MOV AX, Berat", 40, "Memuat nilai variabel 'Berat' ke register AX", (state) => {
    state.ax = state.variables.berat;
    state.ip++;
  });

  addInstr("MOV BX, 100", 41, "Memuat konstanta penskalaan 100 ke register BX", (state) => {
    state.bx = 100;
    state.ip++;
  });

  addInstr("MUL BX", 42, "Mengalikan AX dengan BX (Berat * 100), hasil di DX:AX", (state) => {
    const res = state.ax * state.bx;
    state.ax = res & 0xffff;
    state.dx = (res >> 16) & 0xffff;
    state.ip++;
  });

  addInstr("MOV BX, Pembagi", 43, "Memuat variabel 'Pembagi' ke register BX", (state) => {
    state.bx = state.variables.pembagi;
    state.ip++;
  });

  addInstr("DIV BX", 44, "Membagi AX dengan BX (Pembagi) untuk menemukan nilai akhir BMI", (state) => {
    const num = (state.dx << 16) | state.ax;
    if (state.bx === 0) {
      state.ax = 0; // Prevent divide by zero crashing
    } else {
      state.ax = Math.floor(num / state.bx) & 0xffff;
      state.dx = (num % state.bx) & 0xffff;
    }
    state.ip++;
  });

  addInstr("MOV Hasil, AX", 45, "Menyimpan nilai akhir BMI (register AX) ke variabel 'Hasil'", (state) => {
    state.variables.hasil = state.ax;
    state.ip++;
  });

  addInstr("LEA DX, HasilTxt", 46, "Memuat alamat teks 'BMI Anda = ' ke DX", (state) => {
    state.dx = 0x1030;
    state.ip++;
  });

  addInstr("MOV AH, 09H", 47, "Menyetel layanan DOS 09H di AH", (state) => {
    state.ax = setHByte(state.ax, 0x09);
    state.ip++;
  });

  addInstr("INT 21H", 48, "Memanggil interupsi DOS 21H untuk mencetak prompt hasil", (state) => {
    if (getHByte(state.ax) === 0x09) {
      state.consoleOutput += "\nBMI Anda = ";
      state.terminalLog.push("stdout: BMI Anda = ");
    }
    state.ip++;
  });

  addInstr("MOV AX, Hasil", 49, "Memuat variabel 'Hasil' ke AX untuk dicetak", (state) => {
    state.ax = state.variables.hasil;
    state.ip++;
  });

  addInstr("CALL CetakAngka", 50, "Memanggil subrutin 'CetakAngka' untuk mencetak angka BMI", (state) => {
    state.stack.push(state.ip + 1);
    state.sp -= 2;
    state.ip = getLabelIndex("CetakAngka");
  });

  addInstr("LEA DX, BMIUnitTxt", 51, "Memuat alamat variabel 'BMIUnitTxt' (' kg/m2') ke DX", (state) => {
    state.dx = 0x1040;
    state.ip++;
  });

  addInstr("MOV AH, 09H", 52, "Menyetel layanan DOS 09H di AH", (state) => {
    state.ax = setHByte(state.ax, 0x09);
    state.ip++;
  });

  addInstr("INT 21H", 53, "Memanggil interupsi DOS 21H untuk mencetak ' kg/m2'", (state) => {
    if (getHByte(state.ax) === 0x09) {
      state.consoleOutput += " kg/m2";
      state.terminalLog.push("stdout:  kg/m2");
    }
    state.ip++;
  });

  addInstr("LEA DX, StatusTxt", 54, "Memuat alamat variabel 'StatusTxt' ('\\nStatus = ') ke DX", (state) => {
    state.dx = 0x1050;
    state.ip++;
  });

  addInstr("MOV AH, 09H", 55, "Menyetel layanan DOS 09H di AH", (state) => {
    state.ax = setHByte(state.ax, 0x09);
    state.ip++;
  });

  addInstr("INT 21H", 56, "Memanggil interupsi DOS 21H untuk mencetak 'Status = '", (state) => {
    if (getHByte(state.ax) === 0x09) {
      state.consoleOutput += "\nStatus = ";
      state.terminalLog.push("stdout: Status = ");
    }
    state.ip++;
  });

  addInstr("MOV AX, Hasil", 57, "Memuat variabel 'Hasil' ke AX untuk proses pengelompokan klasifikasi", (state) => {
    state.ax = state.variables.hasil;
    state.ip++;
  });

  addInstr("CMP AX, 18", 58, "Membandingkan AX (BMI) dengan nilai ambang batas Kurus (18)", (state) => {
    state.flags.zf = state.ax === 18;
    state.flags.sf = state.ax < 18;
    state.ip++;
  });

  addInstr("JL BMIKurus", 59, "Lompat ke label 'BMIKurus' jika nilai BMI < 18 (JL)", (state) => {
    if (state.flags.sf) {
      state.ip = getLabelIndex("BMIKurus");
    } else {
      state.ip++;
    }
  });

  addInstr("CMP AX, 24", 60, "Membandingkan AX dengan ambang batas atas Normal (24)", (state) => {
    state.flags.zf = state.ax === 24;
    state.flags.sf = state.ax < 24; // If ax < 24 then sf is set
    state.ip++;
  });

  addInstr("JG CekGemuk", 61, "Lompat ke label 'CekGemuk' jika BMI > 24 (JG)", (state) => {
    if (!state.flags.sf && !state.flags.zf) { // AX > 24
      state.ip = getLabelIndex("CekGemuk");
    } else {
      state.ip++;
    }
  });

  addInstr("LEA DX, NormalTxt", 62, "Memuat alamat variabel status 'Normal' ke DX", (state) => {
    state.dx = 0x1070; // NormalTxt mock address
    state.ip++;
  });

  addInstr("JMP CetakStatus", 63, "Lompat langsung ke label 'CetakStatus'", (state) => {
    state.ip = getLabelIndex("CetakStatus");
  });

  addInstr("CMP AX, 27", 65, "Membandingkan AX dengan ambang batas atas Gemuk (27)", (state) => {
    state.flags.zf = state.ax === 27;
    state.flags.sf = state.ax < 27;
    state.ip++;
  }, "CekGemuk");

  addInstr("JG BMIObes", 66, "Lompat ke label 'BMIObes' jika BMI > 27 (JG)", (state) => {
    if (!state.flags.sf && !state.flags.zf) {
      state.ip = getLabelIndex("BMIObes");
    } else {
      state.ip++;
    }
  });

  addInstr("LEA DX, GemukTxt", 67, "Memuat alamat variabel status 'Gemuk' ke DX", (state) => {
    state.dx = 0x1080;
    state.ip++;
  });

  addInstr("JMP CetakStatus", 68, "Lompat langsung ke label 'CetakStatus'", (state) => {
    state.ip = getLabelIndex("CetakStatus");
  });

  addInstr("LEA DX, KurusTxt", 70, "Memuat alamat variabel status 'Kurus' ke DX", (state) => {
    state.dx = 0x1060;
    state.ip++;
  }, "BMIKurus");

  addInstr("JMP CetakStatus", 71, "Lompat langsung ke label 'CetakStatus'", (state) => {
    state.ip = getLabelIndex("CetakStatus");
  });

  addInstr("LEA DX, ObesTxt", 73, "Memuat alamat variabel status 'Obesitas' ke DX", (state) => {
    state.dx = 0x1090;
    state.ip++;
  }, "BMIObes");

  addInstr("MOV AH, 09H", 75, "Menyetel layanan DOS 09H di AH", (state) => {
    state.ax = setHByte(state.ax, 0x09);
    state.ip++;
  }, "CetakStatus");

  addInstr("INT 21H", 76, "Memanggil interupsi DOS 21H untuk mencetak teks Status terpilih", (state) => {
    if (getHByte(state.ax) === 0x09) {
      let statusStr = "Normal";
      if (state.dx === 0x1060) statusStr = "Kurus";
      else if (state.dx === 0x1070) statusStr = "Normal";
      else if (state.dx === 0x1080) statusStr = "Gemuk";
      else if (state.dx === 0x1090) statusStr = "Obesitas";

      state.consoleOutput += statusStr;
      state.terminalLog.push(`stdout: ${statusStr}`);
    }
    state.ip++;
  });

  addInstr("INT 20H", 77, "Keluar DOS secara normal (INT 20H)", (state) => {
    state.isTerminated = true;
    state.consoleOutput += "\n\n[DOS Program Terminated Successfully]";
    state.terminalLog.push("program: INT 20H exited");
  });

  addInstr("INT 21H", 78, "Interupsi DOS Cadangan", (state) => {
    state.ip++;
  });


  // --- SUBROUTINES ENGINES ---

  // BacaTigaDigit Subroutine
  addInstr("MOV Temp, 0", 81, "Subrutin BacaTigaDigit: Reset variabel 'Temp' ke 0", (state) => {
    state.variables.temp = 0;
    state.ip++;
  }, "BacaTigaDigit");

  addInstr("MOV AH, 01H", 82, "Menyetel interupsi DOS baca karakter (AH=01H)", (state) => {
    state.ax = setHByte(state.ax, 0x01);
    state.ip++;
  });

  addInstr("INT 21H", 83, "Interupsi DOS 21H: Membaca digit ke-1 dari input keyboard mock", (state) => {
    const ch = state.inputBuffer[state.inputPointer] || "0";
    state.inputPointer++;
    state.ax = setLByte(state.ax, ch.charCodeAt(0));
    state.consoleOutput += ch;
    state.terminalLog.push(`stdin: Dibaca karakter '${ch}'`);
    state.ip++;
  });

  addInstr("SUB AL, 30H", 84, "Kurangi AL dengan 30H (desimal 48) untuk mendapatkan nilai angka murni", (state) => {
    const rawVal = getLByte(state.ax) - 48;
    state.ax = setLByte(state.ax, rawVal < 0 ? 0 : rawVal);
    state.ip++;
  });

  addInstr("MOV AH, 0", 85, "Reset AH ke 0 agar registers AX berisi murni nilai 8-bit AL saja", (state) => {
    state.ax = setHByte(state.ax, 0);
    state.ip++;
  });

  addInstr("MOV BX, 100", 86, "Memuat nilai 100 ke BX sebagai pengali digit ratusan", (state) => {
    state.bx = 100;
    state.ip++;
  });

  addInstr("MUL BX", 87, "Mengalikan AX dengan BX (100) untuk konversi posisi digit ratusan", (state) => {
    const res = state.ax * state.bx;
    state.ax = res & 0xffff;
    state.dx = (res >> 16) & 0xffff;
    state.ip++;
  });

  addInstr("MOV Temp, AX", 88, "Menyimpan nilai sementara ratusan ke variabel 'Temp'", (state) => {
    state.variables.temp = state.ax;
    state.ip++;
  });

  addInstr("MOV AH, 01H", 89, "Menyetel interupsi DOS baca karakter (AH=01H)", (state) => {
    state.ax = setHByte(state.ax, 0x01);
    state.ip++;
  });

  addInstr("INT 21H", 90, "Interupsi DOS 21H: Membaca digit ke-2 dari input keyboard", (state) => {
    const ch = state.inputBuffer[state.inputPointer] || "0";
    state.inputPointer++;
    state.ax = setLByte(state.ax, ch.charCodeAt(0));
    state.consoleOutput += ch;
    state.terminalLog.push(`stdin: Dibaca karakter '${ch}'`);
    state.ip++;
  });

  addInstr("SUB AL, 30H", 91, "Ubah karakter ASCII digit ke-2 menjadi angka integer", (state) => {
    const rawVal = getLByte(state.ax) - 48;
    state.ax = setLByte(state.ax, rawVal < 0 ? 0 : rawVal);
    state.ip++;
  });

  addInstr("MOV AH, 0", 92, "Reset AH ke 0", (state) => {
    state.ax = setHByte(state.ax, 0);
    state.ip++;
  });

  addInstr("MOV BX, 10", 93, "Memuat nilai 10 ke BX sebagai pengali digit puluhan", (state) => {
    state.bx = 10;
    state.ip++;
  });

  addInstr("MUL BX", 94, "Mengalikan AX dengan BX (10) untuk menterjemahkan digit puluhan", (state) => {
    const res = state.ax * state.bx;
    state.ax = res & 0xffff;
    state.dx = (res >> 16) & 0xffff;
    state.ip++;
  });

  addInstr("ADD Temp, AX", 95, "Menambahkan hasil puluhan ke variabel 'Temp'", (state) => {
    state.variables.temp = (state.variables.temp + state.ax) & 0xffff;
    state.ip++;
  });

  addInstr("MOV AH, 01H", 96, "Menyetel interupsi DOS baca karakter (AH=01H)", (state) => {
    state.ax = setHByte(state.ax, 0x01);
    state.ip++;
  });

  addInstr("INT 21H", 97, "Interupsi DOS 21H: Membaca digit ke-3 (satuan) dari input keyboard", (state) => {
    const ch = state.inputBuffer[state.inputPointer] || "0";
    state.inputPointer++;
    state.ax = setLByte(state.ax, ch.charCodeAt(0));
    state.consoleOutput += ch;
    state.terminalLog.push(`stdin: Dibaca karakter '${ch}'`);
    state.ip++;
  });

  addInstr("SUB AL, 30H", 98, "Ubah karakter ASCII satuan menjadi angka integer", (state) => {
    const rawVal = getLByte(state.ax) - 48;
    state.ax = setLByte(state.ax, rawVal < 0 ? 0 : rawVal);
    state.ip++;
  });

  addInstr("MOV AH, 0", 99, "Reset AH ke 0", (state) => {
    state.ax = setHByte(state.ax, 0);
    state.ip++;
  });

  addInstr("ADD AX, Temp", 100, "Menambahkan AX (satuan) dengan akumulasi puluhan-ratusan di 'Temp'", (state) => {
    state.ax = (state.ax + state.variables.temp) & 0xffff;
    state.ip++;
  });

  addInstr("RET", 101, "Kembali dari panggilan subrutin 'BacaTigaDigit'", (state) => {
    const retAddr = state.stack.pop();
    state.sp += 2;
    if (retAddr !== undefined) {
      state.ip = retAddr;
    } else {
      state.ip++;
    }
  });


  // CetakAngka Subroutine
  addInstr("CMP AX, 0", 104, "Subrutin CetakAngka: Bandingkan isi register AX dengan 0", (state) => {
    state.flags.zf = state.ax === 0;
    state.ip++;
  }, "CetakAngka");

  addInstr("JNE UbahAngka", 105, "Lompat ke penanganan 'UbahAngka' jika AX bukan nol", (state) => {
    if (!state.flags.zf) {
      state.ip = getLabelIndex("UbahAngka");
    } else {
      state.ip++;
    }
  });

  addInstr("MOV DL, '0'", 106, "Pindahkan karakter ASCII '0' ke DL karena nilai input nol", (state) => {
    state.dx = setLByte(state.dx, "0".charCodeAt(0));
    state.ip++;
  });

  addInstr("MOV AH, 02H", 107, "Setel layanan DOS AH=02H untuk mencetak karakter tunggal di DL", (state) => {
    state.ax = setHByte(state.ax, 0x02);
    state.ip++;
  });

  addInstr("INT 21H", 108, "Interupsi DOS 21H: Tampilkan karakter '0' di layar", (state) => {
    if (getHByte(state.ax) === 0x02) {
      const char = String.fromCharCode(getLByte(state.dx));
      state.consoleOutput += char;
      state.terminalLog.push(`stdout: '${char}'`);
    }
    state.ip++;
  });

  addInstr("RET", 109, "Kembali dari subrutin CetakAngka", (state) => {
    const retAddr = state.stack.pop();
    state.sp += 2;
    if (retAddr !== undefined) {
      state.ip = retAddr;
    } else {
      state.ip++;
    }
  });

  addInstr("MOV CX, 0", 111, "UbahAngka: Reset pencatat hitung digit CX ke 0", (state) => {
    state.cx = 0;
    state.ip++;
  }, "UbahAngka");

  addInstr("MOV BX, 10", 112, "Setel pembagi desimal BX = 10", (state) => {
    state.bx = 10;
    state.ip++;
  });

  addInstr("MOV DX, 0", 114, "AmbilDigit: Reset sisa bagi DX ke 0 sebelum pembagian 16-bit", (state) => {
    state.dx = 0;
    state.ip++;
  }, "AmbilDigit");

  addInstr("DIV BX", 115, "Bagi DX:AX dengan 10. Hasil bagi di AX, sisa (digit terakhir) di DX", (state) => {
    const num = (state.dx << 16) | state.ax;
    state.ax = Math.floor(num / state.bx) & 0xffff;
    state.dx = (num % state.bx) & 0xffff;
    state.ip++;
  });

  addInstr("PUSH DX", 116, "Simpan (PUSH) sisa pembagian (digit) ke tumpukan memori stack", (state) => {
    state.stack.push(state.dx);
    state.sp -= 2;
    state.ip++;
  });

  addInstr("INC CX", 117, "Tambahkan pencatat hitung digit CX sebanyak 1", (state) => {
    state.cx = (state.cx + 1) & 0xffff;
    state.ip++;
  });

  addInstr("CMP AX, 0", 118, "Bandingkan sisa hasil bagi sisa AX dengan 0", (state) => {
    state.flags.zf = state.ax === 0;
    state.ip++;
  });

  addInstr("JNE AmbilDigit", 119, "Lompat kembali ke 'AmbilDigit' jika hasil bagi belum bernilai 0", (state) => {
    if (!state.flags.zf) {
      state.ip = getLabelIndex("AmbilDigit");
    } else {
      state.ip++;
    }
  });

  addInstr("POP DX", 121, "CetakDigit: Ambil (POP) digit terakhir dari stack ke DX", (state) => {
    const val = state.stack.pop();
    state.sp += 2;
    state.dx = val !== undefined ? val : 0;
    state.ip++;
  }, "CetakDigit");

  addInstr("ADD DL, 30H", 122, "Konversi nilai bilangan di DL menjadi kode karakter ASCII (tambah 48)", (state) => {
    const dlVal = (getLByte(state.dx) + 48) & 0xff;
    state.dx = setLByte(state.dx, dlVal);
    state.ip++;
  });

  addInstr("MOV AH, 02H", 123, "Setel layanan cetak karakter tunggal DOS AH=02H", (state) => {
    state.ax = setHByte(state.ax, 0x02);
    state.ip++;
  });

  addInstr("INT 21H", 124, "Interupsi DOS 21H: Cetak karakter numerik hasil konversi ke layar", (state) => {
    if (getHByte(state.ax) === 0x02) {
      const char = String.fromCharCode(getLByte(state.dx));
      state.consoleOutput += char;
      state.terminalLog.push(`stdout: '${char}'`);
    }
    state.ip++;
  });

  addInstr("LOOP CetakDigit", 125, "Kurangi CX. Jika CX > 0, ulangi loop lompat ke 'CetakDigit'", (state) => {
    state.cx = (state.cx - 1) & 0xffff;
    if (state.cx > 0) {
      state.ip = getLabelIndex("CetakDigit");
    } else {
      state.ip++;
    }
  });

  addInstr("RET", 126, "Kembali dari seluruh panggilan subrutin CetakAngka", (state) => {
    const retAddr = state.stack.pop();
    state.sp += 2;
    if (retAddr !== undefined) {
      state.ip = retAddr;
    } else {
      state.ip++;
    }
  });

  return instructions;
}

// Emulate full execution for the given weight and height.
// Returns details about the final result state.
export function executeAssembly(berat: number, tinggi: number): {
  finalState: CPUState;
  log: string;
} {
  const instructions = createInstructionList();
  
  // Custom format to 3 digits (zero-padded)
  const pad3 = (num: number) => num.toString().padStart(3, "0");
  const bStr = pad3(berat);
  const tStr = pad3(tinggi);
  const bufferChars = [...bStr.split(""), ...tStr.split("")];

  const state: CPUState = {
    ax: 0,
    bx: 0,
    cx: 0,
    dx: 0,
    ip: 0,
    sp: 0xfffe, // Top of memory stack
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

  let steps = 0;
  const maxSteps = 2000; // infinite loops protection
  while (!state.isTerminated && state.ip < instructions.length && steps < maxSteps) {
    const currentInstr = instructions[state.ip];
    
    // Save snapshot of state for history tracking before execution
    state.history.push({
      ip: state.ip,
      ax: formatRegisterHex(state.ax),
      bx: formatRegisterHex(state.bx),
      cx: formatRegisterHex(state.cx),
      dx: formatRegisterHex(state.dx),
      sp: state.sp,
      flags: `ZF=${state.flags.zf ? 1 : 0} SF=${state.flags.sf ? 1 : 0}`,
      consoleOutput: state.consoleOutput,
      currentInstructionDesc: currentInstr ? currentInstr.mnemonic + " (" + currentInstr.description + ")" : "Unknown",
      variables: { ...state.variables }
    });

    if (!currentInstr) {
      state.isTerminated = true;
      break;
    }

    const prevIp = state.ip;
    currentInstr.action(state);
    
    // Safety check so we don't spin: if action doesn't increment IP, increment it
    if (state.ip === prevIp && !state.isTerminated) {
      state.ip++;
    }
    steps++;
  }

  // Append history final item
  state.history.push({
    ip: state.ip,
    ax: formatRegisterHex(state.ax),
    bx: formatRegisterHex(state.bx),
    cx: formatRegisterHex(state.cx),
    dx: formatRegisterHex(state.dx),
    sp: state.sp,
    flags: `ZF=${state.flags.zf ? 1 : 0} SF=${state.flags.sf ? 1 : 0}`,
    consoleOutput: state.consoleOutput,
    currentInstructionDesc: "Program Selesai (INT 20H)",
    variables: { ...state.variables }
  });

  return {
    finalState: state,
    log: state.consoleOutput
  };
}
