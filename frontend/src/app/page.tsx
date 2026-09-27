"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, 
  Film, 
  Radio, 
  ShieldCheck, 
  Layers, 
  Activity, 
  Cpu, 
  Fingerprint
} from "lucide-react";
import { Header } from "@/components/Header";
import { ImageDetector } from "@/components/ImageDetector";
import { VideoDetector } from "@/components/VideoDetector";
import { AudioDetector } from "@/components/AudioDetector";

type Modality = "image" | "video" | "audio";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Modality>("image");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navigation Bar */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-100">
              Media Authenticity & Deepfake Analysis
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1.5 leading-relaxed">
              Analyze photos, videos, and voice recordings to distinguish authentic human captures from AI generated media and synthetic voice clones.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Multi Signal Engine Active</span>
            </div>
          </div>
        </div>

        {/* Modality Tab Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center p-1 bg-slate-900/90 border border-slate-800/90 rounded-2xl gap-1 w-full sm:w-auto">
            {/* Image Tab */}
            <button
              onClick={() => setActiveTab("image")}
              className={`relative flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex-1 sm:flex-initial ${
                activeTab === "image"
                  ? "text-white"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              {activeTab === "image" && (
                <motion.div
                  layoutId="activeTabBadge"
                  className="absolute inset-0 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/30"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <Camera className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Photos</span>
            </button>

            {/* Video Tab */}
            <button
              onClick={() => setActiveTab("video")}
              className={`relative flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex-1 sm:flex-initial ${
                activeTab === "video"
                  ? "text-white"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              {activeTab === "video" && (
                <motion.div
                  layoutId="activeTabBadge"
                  className="absolute inset-0 bg-cyan-600 rounded-xl shadow-lg shadow-cyan-600/30"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <Film className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Videos</span>
            </button>

            {/* Audio Tab */}
            <button
              onClick={() => setActiveTab("audio")}
              className={`relative flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex-1 sm:flex-initial ${
                activeTab === "audio"
                  ? "text-white"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              {activeTab === "audio" && (
                <motion.div
                  layoutId="activeTabBadge"
                  className="absolute inset-0 bg-violet-600 rounded-xl shadow-lg shadow-violet-600/30"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <Radio className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Voice Audio</span>
            </button>
          </div>
        </div>

        {/* Tab Content Panes */}
        <div className="pt-1">
          <AnimatePresence mode="wait">
            {activeTab === "image" && (
              <motion.div
                key="image-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <ImageDetector />
              </motion.div>
            )}

            {activeTab === "video" && (
              <motion.div
                key="video-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <VideoDetector />
              </motion.div>
            )}

            {activeTab === "audio" && (
              <motion.div
                key="audio-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <AudioDetector />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Technology Information Cards */}
        <div className="pt-8 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-900/40 border border-slate-800/60 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
              <Fingerprint className="w-4 h-4" /> Camera Sensor & Provenance
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inspects hardware camera sensor noise and cryptographic provenance assertions from modern capture devices and generative tools.
            </p>
          </div>

          <div className="p-4 bg-slate-900/40 border border-slate-800/60 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
              <Cpu className="w-4 h-4" /> Neural Vision Analysis
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Identifies synthetic diffusion tokens and upsampler artifacts generated by Midjourney, DALL-E, Grok, and Stable Diffusion.
            </p>
          </div>

          <div className="p-4 bg-slate-900/40 border border-slate-800/60 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-violet-400">
              <Radio className="w-4 h-4" /> Voice Synthesis Detection
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Analyzes acoustic frequencies and spectrogram harmonics to detect neural vocoders and AI voice clones.
            </p>
          </div>

          <div className="p-4 bg-slate-900/40 border border-slate-800/60 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Activity className="w-4 h-4" /> Compression & Spectrum
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Error Level Analysis and 2D Fourier power spectra expose local inpainting edits and unnatural frequency grid spikes.
            </p>
          </div>
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-800/60 bg-slate-950 py-5 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TrueScan Media Authenticity & Forensic Analysis System</span>
          <span className="text-slate-500">All media processed securely</span>
        </div>
      </footer>
    </div>
  );
}
