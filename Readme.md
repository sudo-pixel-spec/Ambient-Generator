# Ambient Generator

A lightweight web app that generates relaxing ambient environments directly in the browser using the **Web Audio API** and **Canvas animations**.

No audio files are used, sounds are **procedurally generated** in real time.

---

## Features

* 🌧 **Rain** – soft rainfall ambience
* 🌊 **Ocean Waves** – gentle wave patterns
* 🌌 **Night Sky** – calm atmospheric tones
* 🔥 **Fireplace** – warm crackling ambience

Additional features:

* 🎧 Real-time sound synthesis with Web Audio API
* 🎨 Canvas-based animated environments
* 🔊 Volume control
* ⚡ Runs entirely in the browser (no audio assets)

---

## Tech Stack

* **Next.js 16**
* **React 19**
* **TypeScript**
* **Web Audio API**
* **HTML Canvas**

---

## Project Structure

```
src
 ├─ app
 │   ├─ page.tsx
 │   ├─ layout.tsx
 │   └─ globals.css
 │
 ├─ components
 │   └─ CanvasVisualizer.tsx
 │
 └─ lib
     └─ AudioEngine.ts
```

---

## Running Locally

Clone the repository:

```bash
git clone https://github.com/sudo-pixel-spec/Ambient-Generator.git
cd Ambient-Generator
```

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

## Idea

This project explores how **ambient soundscapes can be synthesized entirely in the browser** using mathematical noise generation and oscillators instead of traditional audio files.

---

## License

MIT License
