# Ambient Generator

Ambient Generator is a lightweight web application that creates relaxing soundscapes directly in the browser using **procedural audio synthesis** and **canvas animations**.

Unlike typical ambient apps, this project **does not use audio files**. All sounds are generated in real time using the **Web Audio API**.

---

## Features

### Ambient Environments

* 🌧 **Rain**
* 🌊 **Ocean Waves**
* 🌌 **Night Sky**
* 🔥 **Fireplace**
* 🌲 **Deep Forest**
* 🚆 **Train Journey**

### Audio Controls

* 🎚 **Individual volume control for each environment**
* 🔊 **Master volume control**
* 🎧 **Real-time audio synthesis**
* ⚡ **No audio assets required**

### Experience Features

* 🧘 **Zen Mode** for distraction-free listening
* ⏱ **Timer** to stop ambience automatically
* 🎛 **Preset soundscapes**
* 🖱 **Interactive spatial audio (mouse-based panning)**

### Visuals

* 🎨 Canvas-based animated environments
* 🌌 Dynamic visualizer that adapts to the active ambience

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
 │   ├─ globals.css
 │   └─ page.module.css
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

Run the development server:

```bash
npm run dev
```

Open the app:

```
http://localhost:3000
```

---

## How It Works

Ambient Generator synthesizes sound using mathematical noise and oscillator patterns.

Examples:

* **Rain** → filtered white noise bursts
* **Waves** → pink noise with rhythmic gain modulation
* **Fireplace** → brown noise rumble with random crackle spikes
* **Night Sky** → layered oscillators with slow LFO modulation

This allows the entire ambient environment to run **fully client-side** with minimal assets.

---

## Future Improvements

Possible enhancements:

* More ambient environments
* Custom sound mixing
* Saveable user presets
* Mobile optimization
* Spatial audio enhancements

---

## License

MIT License
