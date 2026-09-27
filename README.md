# TrueScan • Media Authenticity & Deepfake Forensic Platform

TrueScan is a multi-modal digital forensics and media authenticity engine designed to detect AI generated imagery, deepfake videos, and synthetic voice clones with high accuracy.

---

## Key Features

- **Photo & Image Forensics**:
  - Full-resolution camera sensor noise analysis (preserves 12MP–100MP EXIF data).
  - Cryptographic **C2PA / JUMBF Container Extraction** (Grok Imagine, Midjourney v6, OpenAI DALL-E 3, Adobe Firefly, Google SynthID).
  - Fine-tuned **Vision Transformer (ViT)** analyzing latent diffusion upsampler grid tokens.
  - **Error Level Analysis (ELA)** for localized inpainting and compression seam detection.
  - **2D Fourier Transform (FFT)** power spectrum inspecting checkerboard artifact frequencies.

- **Video Temporal Stream Forensics**:
  - Keyframe extraction and frame-by-frame temporal consistency verification.
  - Multi-frame ViT inference for facial manipulation and boundary blending anomalies.

- **Audio & Voice Forensics**:
  - **Audio Spectrogram Transformer (AST)** trained on VoxCelebSpoof.
  - High-frequency 16kHz neural vocoder cutoff detection.
  - Spectral flatness and glottal pulse consistency analysis.

- **Modern Cyber-Forensic Web UI**:
  - Built with **Next.js 16 (Turbopack)**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**.
  - High-precision edge-to-edge laser scan HUD and interactive forensic audit reports.

---

## Project Structure

```
├── forensics.py       # Core multi-modal forensic inspection engine
├── server.py          # FastAPI REST API backend
├── images/            # Image verification benchmarks
├── videos/            # Video verification benchmarks
├── audios/            # Voice audio verification benchmarks
├── frontend/          # Next.js 16 + TypeScript + Tailwind CSS web app
│   ├── src/
│   │   ├── app/       # Layout, globals.css, and main dashboard
│   │   └── components/# Modality inspectors (Image, Video, Audio, Report)
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js v18+ & npm

### 1. Backend Setup (FastAPI)

```bash
# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install Python dependencies
pip install torch torchvision torchaudio transformers librosa fastapi uvicorn Pillow scipy numpy
```

Start the FastAPI server:

```bash
python server.py
```

API will be available at `http://127.0.0.1:8000` (Health Check: `http://127.0.0.1:8000/api/health`).

---

### 2. Frontend Setup (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## License

This project is licensed under the MIT License.
