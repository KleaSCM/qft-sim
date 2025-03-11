

"use client";

import { useEffect, useRef, useState } from "react";

export default function CuteQuantumInterference() {
  const [wasmModule, setWasmModule] = useState<WebAssembly.Instance | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [params, setParams] = useState({
    slit1: 0.3,
    slit2: 0.7,
    t: 1,
    k: 10,
  });
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    async function loadWasm() {
      try {
        const res = await fetch("/physics.wasm");
        const bytes = await res.arrayBuffer();
        const importObject = {
          wasi_snapshot_preview1: {
            proc_exit: (code: number) =>
              console.log("proc_exit called with code", code),
          },
        };
        const { instance } = await WebAssembly.instantiate(bytes, importObject);
        setWasmModule(instance);
      } catch (error) {
        console.error("Failed to load WASM module", error);
      }
    }
    loadWasm();
  }, []);

  // Animation loop: draw a new row of the evolving heatmap when playing.
  useEffect(() => {
    if (!wasmModule || !isPlaying) return;
    const simulateDoubleSlit = wasmModule.exports
      .simulate_double_slit as CallableFunction;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    let timeOffset = 0;
    const numPoints = width; // one intensity value per pixel horizontally

    const animate = () => {
      // Shift the existing canvas up by one row.
      const imageData = ctx.getImageData(0, 1, width, height - 1);
      ctx.putImageData(imageData, 0, 0);

      // Compute a new row of intensities.
      const row = new Uint8ClampedArray(width * 4);
      let maxIntensity = 0;
      const intensities: number[] = [];
      for (let x = 0; x < numPoints; x++) {
        const screen_x = x / (numPoints - 1);
        // Modulate 't' with timeOffset to create time evolution.
        const intensity = simulateDoubleSlit(
          params.slit1,
          params.slit2,
          screen_x,
          params.t + timeOffset,
          params.k
        );
        intensities.push(intensity);
        if (intensity > maxIntensity) maxIntensity = intensity;
      }

      // Normalize intensities to grayscale values.
      for (let x = 0; x < numPoints; x++) {
        const norm = maxIntensity > 0 ? intensities[x] / maxIntensity : 0;
        const value = Math.floor(norm * 255);
        row[x * 4] = value; // Red
        row[x * 4 + 1] = value; // Green
        row[x * 4 + 2] = value; // Blue
        row[x * 4 + 3] = 255; // Alpha
      }

      const rowImageData = new ImageData(row, width, 1);
      ctx.putImageData(rowImageData, 0, height - 1);

      timeOffset += 0.02; // increment time for next frame
      requestAnimationFrame(animate);
    };

    const animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [wasmModule, params, isPlaying]);

  const togglePlay = () => setIsPlaying((prev) => !prev);

  return (
    <main
      style={{
        padding: "2rem",
        textAlign: "center",
        fontFamily: "'Comic Neue', cursive, sans-serif",
        background: "linear-gradient(135deg, #ffc0cb, #e6e6fa)",
        minHeight: "100vh",
        color: "#330033",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
        Quantum Interference
      </h1>
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        style={{
          border: "3px solid hotpink",
          borderRadius: "8px",
          background: "#000",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
        }}
      />
      <div style={{ marginTop: "1rem" }}>
        <button
          onClick={togglePlay}
          style={{
            padding: "0.75rem 1.5rem",
            fontSize: "1.2rem",
            borderRadius: "8px",
            border: "none",
            background: "hotpink",
            color: "#fff",
            cursor: "pointer",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.3)",
          }}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
      </div>
      <div
        style={{
          marginTop: "1.5rem",
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ background: "#fff", padding: "0.5rem 1rem", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
          <label>
            Slit 1: {params.slit1.toFixed(2)}
            <br />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={params.slit1}
              onChange={(e) =>
                setParams({ ...params, slit1: parseFloat(e.target.value) })
              }
              style={{ cursor: "pointer" }}
            />
          </label>
        </div>
        <div style={{ background: "#fff", padding: "0.5rem 1rem", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
          <label>
            Slit 2: {params.slit2.toFixed(2)}
            <br />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={params.slit2}
              onChange={(e) =>
                setParams({ ...params, slit2: parseFloat(e.target.value) })
              }
              style={{ cursor: "pointer" }}
            />
          </label>
        </div>
        <div style={{ background: "#fff", padding: "0.5rem 1rem", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
          <label>
            t: {params.t.toFixed(2)}
            <br />
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={params.t}
              onChange={(e) =>
                setParams({ ...params, t: parseFloat(e.target.value) })
              }
              style={{ cursor: "pointer" }}
            />
          </label>
        </div>
        <div style={{ background: "#fff", padding: "0.5rem 1rem", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
          <label>
            k: {params.k}
            <br />
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={params.k}
              onChange={(e) =>
                setParams({ ...params, k: parseFloat(e.target.value) })
              }
              style={{ cursor: "pointer" }}
            />
          </label>
        </div>
      </div>
      <div
        style={{
          marginTop: "2rem",
          textAlign: "left",
          maxWidth: "800px",
          margin: "2rem auto",
          background: "#fff0f6",
          padding: "1rem",
          borderRadius: "8px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2 style={{ color: "hotpink" }}>Underlying Physics Equations</h2>
        <p>
          In the double-slit experiment, the amplitude from each slit is approximated as:
        </p>
        <pre style={{ background: "#ffe4e6", padding: "0.5rem", borderRadius: "4px" }}>
A(d) = exp(-d²/(2t)) · cos(k·d) / (d + ε)
        </pre>
        <p>
          where <em>d</em> is the distance from a slit to a point on the detection screen, <em>t</em> controls the Gaussian envelope, <em>k</em> is the wave number, and <em>ε</em> is a small constant.
        </p>
        <p>
          The total amplitude at a screen position is the sum of the amplitudes from both slits:
        </p>
        <pre style={{ background: "#ffe4e6", padding: "0.5rem", borderRadius: "4px" }}>
A_total = A1 + A2
        </pre>
        <p>
          And the intensity is given by:
        </p>
        <pre style={{ background: "#ffe4e6", padding: "0.5rem", borderRadius: "4px" }}>
I = |A_total|²
        </pre>
      </div>
    </main>
  );
}
