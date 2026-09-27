"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UploadCloud, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Activity, 
  Radio, 
  ShieldCheck, 
  ShieldAlert,
  Disc,
  Music
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

export function AudioDetector() {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanStep, setScanStep] = useState<string>("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioElementRef = useRef<HTMLAudioElement>(null);

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;
    setError(null);
    setResult(null);
    setFile(selectedFile);

    if (audioUrl && audioUrl.startsWith("blob:")) {
      URL.revokeObjectURL(audioUrl);
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setAudioUrl(objectUrl);
    setIsPlaying(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    setFile(null);
    if (audioUrl && audioUrl.startsWith("blob:")) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setResult(null);
    setError(null);
    setIsPlaying(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const togglePlay = () => {
    if (!audioElementRef.current) return;
    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  const loadSample = async (samplePath: string, name: string) => {
    try {
      setLoading(true);
      setError(null);
      setScanStep(`Examining voice sample: ${name}...`);
      
      const res = await fetch(`${API_BASE_URL}/api/analyze/sample?sample_path=` + encodeURIComponent(samplePath), {
        method: "POST"
      });
      
      if (!res.ok) throw new Error("Could not process audio sample.");
      const data = await res.json();
      
      if (data.success) {
        setResult(data.metrics);
        setAudioUrl(`${API_BASE_URL}/` + samplePath.replace(/\\/g, "/"));
        setIsPlaying(false);
      } else {
        throw new Error(data.error || "Analysis failed");
      }
    } catch (err: any) {
      setError(err.message || `Failed to analyze audio sample. Ensure FastAPI server is running at ${API_BASE_URL}.`);
    } finally {
      setLoading(false);
      setScanStep("");
    }
  };

  const runAnalysis = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setScanStep("Transforming acoustic waveform into spectrogram...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setTimeout(() => setScanStep("Evaluating neural vocoder harmonics and frequency cutoff..."), 600);
      setTimeout(() => setScanStep("Calculating voice authenticity scores..."), 1200);

      const res = await fetch(`${API_BASE_URL}/api/analyze/audio`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setResult(data.metrics);
      } else {
        throw new Error(data.error || "Analysis failed");
      }
    } catch (err: any) {
      setError(err.message || `Failed to analyze audio. Please ensure the backend is running at ${API_BASE_URL}.`);
    } finally {
      setLoading(false);
      setScanStep("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Audio Dropzone & Controls */}
        <div className="lg:col-span-5 space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border border-dashed border-slate-700/80 hover:border-violet-500/80 bg-slate-900/40 hover:bg-slate-900/70 rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group relative min-h-[240px] sm:min-h-[260px]"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,.wav,.flac,.mp3,.ogg,.m4a"
              className="hidden"
              onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
            />

            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-3 sm:mb-4 group-hover:scale-105 transition-transform duration-200">
              <Radio className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>

            <h3 className="text-sm font-semibold text-slate-200">
              {file ? file.name : "Drop an audio file here or browse"}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Supports FLAC, WAV, MP3, OGG, M4A
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Full acoustic dynamic range and voice harmonics analyzed
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={runAnalysis}
              disabled={!file || loading}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:hover:bg-violet-600 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <Activity className="w-4 h-4" />
              {loading ? "Analyzing Voice..." : "Inspect Voice Authenticity"}
            </button>

            <button
              onClick={handleClear}
              disabled={!file && !result && !audioUrl}
              className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed border border-slate-700/60"
            >
              <Trash2 className="w-4 h-4 text-slate-400" />
              Clear
            </button>
          </div>

          {/* Benchmark Samples Quick Switcher with Visible Cards */}
          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                Benchmark Verification Samples
              </span>
              <span className="text-xs text-slate-500">Tap to inspect</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => loadSample("audios/DF_E_2000031.flac", "Human Speech")}
                disabled={loading}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 hover:bg-emerald-950/30 border border-slate-800 hover:border-emerald-700/50 text-left transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-lg bg-emerald-950/50 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
                  <Volume2 className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Real Human Speech</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    Clean Voice Recording
                  </p>
                </div>
              </button>

              <button
                onClick={() => loadSample("audios/DF_E_2000027.flac", "AI Voice Clone")}
                disabled={loading}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 hover:bg-red-950/30 border border-slate-800 hover:border-red-700/50 text-left transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-lg bg-red-950/50 border border-red-800/60 flex items-center justify-center text-red-400 shrink-0">
                  <Radio className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-xs font-medium text-red-400">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">AI Voice Clone</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    Neural TTS Vocoder
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Audio Waveform Player */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex-1 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 sm:p-6 relative overflow-hidden flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <Disc className={`w-4 h-4 text-violet-400 ${isPlaying ? "animate-spin" : ""}`} />
                <span className="text-xs font-medium text-slate-300">
                  Acoustic Signal Player
                </span>
              </div>
              {audioUrl && (
                <span className="text-xs text-slate-400">
                  Ready
                </span>
              )}
            </div>

            {/* Audio Player View */}
            <div className="py-6 flex flex-col items-center justify-center min-h-[220px]">
              {audioUrl ? (
                <div className={`w-full max-w-md bg-slate-950/80 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl transition-all duration-300 relative overflow-hidden ${
                  loading ? "blur-[3px] brightness-75 scale-[0.99]" : "blur-0 brightness-100 scale-100"
                }`}>
                  <audio
                    ref={audioElementRef}
                    src={audioUrl}
                    onEnded={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    className="hidden"
                  />

                  {/* Waveform Visualization */}
                  <div className="flex items-center justify-center gap-1.5 h-16 px-2 sm:px-4">
                    {[12, 28, 45, 18, 60, 34, 75, 40, 22, 55, 70, 30, 48, 85, 38, 20, 50, 65, 32, 14].map(
                      (height, idx) => (
                        <motion.div
                          key={idx}
                          animate={{
                            height: isPlaying ? [height * 0.4, height, height * 0.3] : height * 0.3,
                          }}
                          transition={{
                            duration: 0.5 + (idx % 4) * 0.15,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut",
                          }}
                          className={`w-1.5 rounded-full transition-colors ${
                            isPlaying ? "bg-violet-400" : "bg-slate-700"
                          }`}
                          style={{ height: `${height * 0.3}%` }}
                        />
                      )
                    )}
                  </div>

                  {/* Player Controls */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={togglePlay}
                      className="w-12 h-12 rounded-full bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center shadow-lg shadow-violet-600/30 transition-all cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>

                    <div className="flex-1 px-4 text-left min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate">
                        {file ? file.name : "Benchmark Voice Sample"}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {isPlaying ? "Playing audio..." : "Click play to listen"}
                      </p>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
                      {isPlaying ? <Volume2 className="w-4 h-4 text-violet-400" /> : <VolumeX className="w-4 h-4" />}
                    </div>
                  </div>
                  {/* Edge-to-Edge Straight Hyper-Bright Laser Scan Sweep: Up to Down */}
                  <AnimatePresence>
                    {loading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 pointer-events-none z-30 overflow-hidden rounded-2xl"
                      >
                        {/* Straight Solid White & Neon Violet Laser Line */}
                        <motion.div
                          initial={{ top: "0%" }}
                          animate={{ top: "100%" }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="laser-line-audio"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Radio className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-400">No audio sample loaded</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload a voice recording or select a sample to inspect
                  </p>
                </div>
              )}
            </div>

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
                      {result.is_real ? "Authentic Human Voice Verified" : "AI Voice Clone or Synthetic Speech Detected"}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {result.is_real 
                        ? "Natural vocal tract dynamics and harmonics confirmed" 
                        : "Neural vocoder artifacts or synthetic synthesis detected"}
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
                      <CheckCircle2 className="w-3.5 h-3.5" /> Authentic Voice Probability
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
                      <AlertTriangle className="w-3.5 h-3.5" /> Synthetic Voice Probability
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
              modality="audio"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
