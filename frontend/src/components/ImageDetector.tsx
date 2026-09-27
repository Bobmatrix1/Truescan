"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Scan, 
  Eye, 
  Layers, 
  Activity, 
  Camera, 
  Fingerprint, 
  Sliders,
  ShieldCheck,
  ShieldAlert,
  Info
} from "lucide-react";
import { HumanReport } from "./HumanReport";
import { API_BASE_URL } from "@/lib/api";

interface AnalysisResult {
  is_real: boolean;
  verdict: string;
  confidence: number;
  probability_real: number;
  probability_fake: number;
  report_markdown: string;
}

export function ImageDetector() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanStep, setScanStep] = useState<string>("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [elaImage, setElaImage] = useState<string | null>(null);
  const [fftImage, setFftImage] = useState<string | null>(null);
  const [selectedVisual, setSelectedVisual] = useState<"ela" | "fft" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;
    setError(null);
    setResult(null);
    setElaImage(null);
    setFftImage(null);
    setFile(selectedFile);

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    setFile(null);
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setResult(null);
    setElaImage(null);
    setFftImage(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const loadSample = async (samplePath: string, name: string) => {
    try {
      setLoading(true);
      setError(null);
      setScanStep(`Examining ${name}...`);
      
      const res = await fetch(`${API_BASE_URL}/api/analyze/sample?sample_path=` + encodeURIComponent(samplePath), {
        method: "POST"
      });
      
      if (!res.ok) throw new Error("Could not process sample.");
      const data = await res.json();
      
      if (data.success) {
        setResult(data.metrics);
        setElaImage(data.visualizations?.ela_image || null);
        setFftImage(data.visualizations?.fft_spectrum || null);
        setPreviewUrl(`${API_BASE_URL}/` + samplePath.replace(/\\/g, "/"));
      } else {
        throw new Error(data.error || "Analysis failed");
      }
    } catch (err: any) {
      setError(err.message || "Failed to analyze sample. Make sure the backend server is running.");
    } finally {
      setLoading(false);
      setScanStep("");
    }
  };

  const runAnalysis = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setScanStep("Reading camera sensor metadata and provenance...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setTimeout(() => setScanStep("Analyzing frequency spectrum and compression levels..."), 500);
      setTimeout(() => setScanStep("Evaluating neural vision patterns..."), 1000);

      const res = await fetch(`${API_BASE_URL}/api/analyze/image`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setResult(data.metrics);
        setElaImage(data.visualizations?.ela_image || null);
        setFftImage(data.visualizations?.fft_spectrum || null);
      } else {
        throw new Error(data.error || "Analysis failed");
      }
    } catch (err: any) {
      setError(err.message || `Failed to analyze image. Please ensure the backend is active at ${API_BASE_URL}.`);
    } finally {
      setLoading(false);
      setScanStep("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Upload Dropzone & Controls */}
        <div className="lg:col-span-5 space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border border-dashed border-slate-700/80 hover:border-blue-500/80 bg-slate-900/40 hover:bg-slate-900/70 rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group relative min-h-[240px] sm:min-h-[270px]"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
            />

            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3 sm:mb-4 group-hover:scale-105 transition-transform duration-200">
              <UploadCloud className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>

            <h3 className="text-sm font-semibold text-slate-200">
              {file ? file.name : "Drop an image here or browse"}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Supports JPG, PNG, WEBP files
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Full resolution sensor noise and metadata preserved
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={runAnalysis}
              disabled={!file || loading}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <Scan className="w-4 h-4" />
              {loading ? "Analyzing..." : "Scan Image Authenticity"}
            </button>

            <button
              onClick={handleClear}
              disabled={!file && !result && !previewUrl}
              className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed border border-slate-700/60"
            >
              <Trash2 className="w-4 h-4 text-slate-400" />
              Clear
            </button>
          </div>

          {/* Benchmark Samples Quick Switcher with Visible Thumbnails */}
          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                Benchmark Verification Samples
              </span>
              <span className="text-xs text-slate-500">Tap to inspect</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Real Sample Card with Visible Thumbnail */}
              <button
                onClick={() => loadSample("images/real image.jpeg", "Real Camera Photo")}
                disabled={loading}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 hover:bg-emerald-950/30 border border-slate-800 hover:border-emerald-700/50 text-left transition-all group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 shrink-0 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${API_BASE_URL}/images/real%20image.jpeg`}
                    alt="Real Sample"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Real Phone Photo</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    Samsung Galaxy A16
                  </p>
                </div>
              </button>

              {/* AI Inpainted Deepfake Card with Visible Thumbnail */}
              <button
                onClick={() => loadSample("images/deepfake image.jpeg", "AI Inpainted Deepfake")}
                disabled={loading}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 hover:bg-red-950/30 border border-slate-800 hover:border-red-700/50 text-left transition-all group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 shrink-0 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${API_BASE_URL}/images/deepfake%20image.jpeg`}
                    alt="AI Deepfake Sample"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-xs font-medium text-red-400">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">AI Deepfake</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    Outfit Inpainted
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Live Image Canvas & Visualizers */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex-1 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 sm:p-6 relative overflow-hidden flex flex-col justify-between">
            {/* Canvas Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-medium text-slate-300">
                  Image Inspection Canvas
                </span>
              </div>
              {previewUrl && (
                <span className="text-xs text-slate-400">
                  Preview Active
                </span>
              )}
            </div>

            {/* Middle Preview Viewport */}
            <div className="py-4 flex flex-col items-center justify-center min-h-[260px] sm:min-h-[300px] relative">
              {previewUrl ? (
                <div className="relative rounded-xl overflow-hidden max-h-[340px] sm:max-h-[380px] w-full flex items-center justify-center bg-slate-950/80 border border-slate-800/80 group shadow-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className={`max-h-[340px] sm:max-h-[380px] w-auto max-w-full object-contain rounded-lg transition-all duration-300 ${
                      loading ? "blur-[3px] brightness-75 scale-[0.99]" : "blur-0 brightness-100 scale-100"
                    }`}
                  />

                  {/* Edge-to-Edge Straight Hyper-Bright Laser Scan Sweep: Up to Down */}
                  <AnimatePresence>
                    {loading && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 pointer-events-none z-30 overflow-hidden rounded-xl"
                      >
                        {/* Straight Solid White & Neon Blue Laser Line */}
                        <motion.div
                          initial={{ top: "0%" }}
                          animate={{ top: "100%" }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="laser-line-image"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-10">
                  <Camera className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-400">No image loaded</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload an image or select a sample to inspect
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Visualizer Toggles */}
            {(elaImage || fftImage) && (
              <div className="pt-4 border-t border-slate-800/60 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 mr-1">Forensic Layers:</span>
                
                {elaImage && (
                  <button
                    onClick={() => setSelectedVisual(selectedVisual === "ela" ? null : "ela")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                      selectedVisual === "ela"
                        ? "bg-blue-600 text-white border-blue-500"
                        : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Error Level Analysis (ELA)
                  </button>
                )}

                {fftImage && (
                  <button
                    onClick={() => setSelectedVisual(selectedVisual === "fft" ? null : "fft")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                      selectedVisual === "fft"
                        ? "bg-blue-600 text-white border-blue-500"
                        : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800"
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    2D Fourier Spectrum (FFT)
                  </button>
                )}
              </div>
            )}

            {/* Visualizer Drawer Modal */}
            <AnimatePresence>
              {selectedVisual && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-slate-800/60"
                >
                  <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-200">
                          {selectedVisual === "ela" ? "Error Level Analysis Heatmap" : "2D Fourier Power Spectrum"}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedVisual(null)}
                        className="text-xs text-slate-400 hover:text-slate-200"
                      >
                        Close
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-48 h-48 rounded-lg overflow-hidden bg-black border border-slate-800 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selectedVisual === "ela" ? (elaImage || "") : (fftImage || "")}
                          alt="Forensic View"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="text-xs text-slate-400 space-y-1.5">
                        {selectedVisual === "ela" ? (
                          <>
                            <p className="font-medium text-slate-200">Compression Disparity Map</p>
                            <p>Highlights differences in JPEG error levels across regions. Inpainted or edited sections display noticeably brighter error patterns compared to untouched background pixels.</p>
                          </>
                        ) : (
                          <>
                            <p className="font-medium text-slate-200">Frequency Grid Anomaly Map</p>
                            <p>Reveals high-frequency artifacts caused by neural upsamplers. AI models frequently produce regular grid spikes or unnatural radial decay in the frequency domain.</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-950/40 border border-red-800/60 rounded-xl flex items-center gap-2 text-xs text-red-300">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="space-y-6 pt-2"
          >
            {/* Verdict Card */}
            <div
              className={`rounded-2xl p-5 sm:p-6 border backdrop-blur-sm relative overflow-hidden ${
                result.is_real
                  ? "bg-emerald-950/20 border-emerald-800/50 text-emerald-300"
                  : "bg-red-950/20 border-red-800/50 text-red-300"
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                      result.is_real
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                        : "bg-red-500/10 border border-red-500/20 text-red-400"
                    }`}
                  >
                    {result.is_real ? <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" /> : <ShieldAlert className="w-6 h-6 sm:w-7 sm:h-7" />}
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-100">
                      {result.is_real ? "Authentic Camera Photo Verified" : "AI Generated or Manipulated Media Detected"}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {result.is_real 
                        ? "Original optical sensor signature confirmed" 
                        : "Generative neural synthesis markers identified"}
                    </p>
                  </div>
                </div>

                <div className="self-end sm:self-center text-right">
                  <p className="text-xs text-slate-400">Confidence</p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-100">{result.confidence.toFixed(1)}%</p>
                </div>
              </div>

              {/* Confidence Gauges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-5 pt-5 border-t border-slate-800/60">
                <div className="bg-slate-900/60 rounded-xl p-3.5 sm:p-4 border border-slate-800/60">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Authentic Probability
                    </span>
                    <span className="text-slate-200 font-semibold">{result.probability_real.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.probability_real}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="bg-emerald-500 h-full rounded-full"
                    />
                  </div>
                </div>

                <div className="bg-slate-900/60 rounded-xl p-3.5 sm:p-4 border border-slate-800/60">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-red-400 font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> AI Synthetic Probability
                    </span>
                    <span className="text-slate-200 font-semibold">{result.probability_fake.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.probability_fake}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="bg-red-500 h-full rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Human-Readable Forensic Report Card */}
            <HumanReport
              reportMarkdown={result.report_markdown}
              isReal={result.is_real}
              confidence={result.confidence}
              modality="image"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
