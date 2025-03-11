Interactive simulation of the classic double-slit interference experiment—a quantum phenomenon that showcases the wave-particle duality of light and matter. By combining the raw power of quantum physics with modern web technologies

## Key Features:

### Real-Time Quantum Dynamics:
The simulation uses a dynamic heatmap that scrolls over time, where each new row represents the evolving interference pattern computed via a quantum model.

### Interactive Controls:
Users can adjust key parameters—including the positions of the two slits, the Gaussian envelope parameter (t), and the wave number (k)—via intuitive sliders. This allows for on-the-fly exploration of how changes in these parameters affect the interference pattern.

### Deep Physics Under the Hood:
The simulation is powered by a C++ module compiled to WebAssembly with Emscripten. The underlying model approximates the amplitude from each slit using:
    <br><code>A(d) = exp(-d²/(2t)) · cos(k·d) / (d + ε)</code>
where d is the distance from the slit to the detection screen. The total amplitude is computed as the sum from both slits, and the intensity is given by the square of this total amplitude (<code>I = |A_total|²</code>).

### Modern Tech Stack:
Built using Next.js and TypeScript on the front end, the simulation leverages WebAssembly for high-performance physics computations. The integration of C++ code through Emscripten illustrates a seamless blend of classical physics programming with modern web development.
