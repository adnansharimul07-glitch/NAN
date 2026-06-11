/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { executeAssembly } from "./src/lib/assemblyEmulator.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON
  app.use(express.json());

  // API route for BMI calculation using Assembly execution
  app.post("/api/calculate-assembly", (req, res) => {
    try {
      const { berat, tinggi } = req.body;
      
      const beratNum = Number(berat);
      const tinggiNum = Number(tinggi);

      if (isNaN(beratNum) || isNaN(tinggiNum) || beratNum <= 0 || tinggiNum <= 0) {
        return res.status(400).json({ 
          error: "Input berat dan tinggi badan harus bernilai angka positif." 
        });
      }

      // Execute our virtual assembly program using the simulated CPU
      const result = executeAssembly(beratNum, tinggiNum);

      return res.json({
        success: true,
        berat: beratNum,
        tinggi: tinggiNum,
        hasilBmi: result.finalState.variables.hasil,
        status: result.finalState.variables.hasil < 18 ? "Kurus" :
                result.finalState.variables.hasil <= 24 ? "Normal" :
                result.finalState.variables.hasil <= 27 ? "Gemuk" : "Obesitas",
        consoleOutput: result.finalState.consoleOutput,
        registers: {
          ax: result.finalState.ax,
          bx: result.finalState.bx,
          cx: result.finalState.cx,
          dx: result.finalState.dx,
          sp: result.finalState.sp
        },
        history: result.finalState.history
      });
    } catch (err: any) {
      console.error("Assembly Server Error:", err);
      return res.status(500).json({ error: err?.message || "Internal server error" });
    }
  });

  // Vite middleware for development / assets flow
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Express Backend Started] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
