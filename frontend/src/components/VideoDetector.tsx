"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UploadCloud, 
  Video, 
  Film, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Scan, 
  Activity, 
  ShieldCheck, 
  ShieldAlert,
  Play
} from "lucide-react";
import { HumanReport } from "./HumanReport";

interface AnalysisResult {
  is_real: boolean;
  verdict: string;
  confidence: number;
  probability_real: number;
  probability_fake: number;
  report_markdown: string;
}

export function VideoDetector() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [previewFrame, setPreviewFrame] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanStep, setScanStep] = useState<string>("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoElementRef = useRef<HTMLVideoElement>(null);

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;
    setError(null);
    setResult(null);
    setPreviewFrame(null);
    setFile(selectedFile);

    if (videoUrl && videoUrl.startsWith("blob:")) {
      URL.revokeObjectURL(videoUrl);
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setVideoUrl(objectUrl);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    setFile(null);
    if (videoUrl && videoUrl.startsWith("blob:")) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoUrl(null);
    setPreviewFrame(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const loadSample = async (samplePath: string, name: string) => {
    try {
      setLoading(true);
      setError(null);
      setScanStep(`Examining video sequence: ${name}...`);
      
      const res = await fetch("http://127.0.0.1:8000/api/analyze/sample?sample_path=" + encodeURIComponent(samplePath), {
        method: "POST"
      });
      
      if (!res.ok) throw new Error("Could not process video sample.");
      const data = await res.json();
      
      if (data.success) {
        setResult(data.metrics);
        setPreviewFrame(data.visualizations?.preview_frame || null);
        setVideoUrl("http://127.0.0.1:8000/" + samplePath.replace(/\\/g, "/"));
      } else {
        throw new Error(data.error || "Analysis failed");
      }
    } catch (err: any) {
      setError(err.message || "Failed to analyze video sample. Ensure FastAPI server is running.");
    } finally {
      setLoading(false);
      setScanStep("");
    }
  };

  const runAnalysis = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setScanStep("Extracting keyframes from video stream...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setTimeout(() => setScanStep("Analyzing frame sequences for deepfake manipulation..."), 1000);
      setTimeout(() => setScanStep("Checking temporal consistency and face boundaries..."), 2000);

      const res = await fetch("http://127.0.0.1:8000/api/analyze/video", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setResult(data.metrics);
        setPreviewFrame(data.visualizations?.preview_frame || null);
      } else {
        throw new Error(data.error || "Analysis failed");
      }
    } catch (err: any) {
      setError(err.message || "Failed to analyze video. Please ensure the backend is running at http://127.0.0.1:8000.");
    } finally {
      setLoading(false);
      setScanStep("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Video Dropzone & Controls */}
        <div className="lg:col-span-5 space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border border-dashed border-slate-700/80 hover:border-cyan-500/80 bg-slate-900/40 hover:bg-slate-900/70 rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group relative min-h-[240px] sm:min-h-[260px]"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,.mp4,.mov,.avi,.webm"
              className="hidden"
              onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
            />

            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3 sm:mb-4 group-hover:scale-105 transition-transform duration-200">
              <Film className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>

            <h3 className="text-sm font-semibold text-slate-200">
              {file ? file.name : "Drop a video file here or browse"}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Supports MP4, MOV, AVI, WEBM
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Multi-frame keyframe and temporal flicker evaluated
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={runAnalysis}
              disabled={!file || loading}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <Scan className="w-4 h-4" />
              {loading ? "Scanning Frames..." : "Scan Video Authenticity"}
            </button>

            <button
              onClick={handleClear}
              disabled={!file && !result && !videoUrl}
              className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed border border-slate-700/60"
            >
              <Trash2 className="w-4 h-4 text-slate-400" />
              Clear
            </button>
          </div>

          {/* Benchmark Samples Quick Switcher with Visible Previews */}
          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                Benchmark Verification Samples
              </span>
              <span className="text-xs text-slate-500">Tap to inspect</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => loadSample("videos/real-1.mp4", "Authentic Video")}
                disabled={loading}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 hover:bg-emerald-950/30 border border-slate-800 hover:border-emerald-700/50 text-left transition-all group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden relative shrink-0 flex items-center justify-center">
                  <video
                    src="http://127.0.0.1:8000/videos/real-1.mp4"
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Real Video</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    Natural Camera Capture
                  </p>
                </div>
              </button>

              <button
                onClick={() => loadSample("videos/aaa.mp4", "Deepfake Face Swap")}
                disabled={loading}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 hover:bg-red-950/30 border border-slate-800 hover:border-red-700/50 text-left transition-all group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden relative shrink-0 flex items-center justify-center">
                  <video
                    src="http://127.0.0.1:8000/videos/aaa.mp4"
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-xs font-medium text-red-400">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">AI Deepfake</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    Face Swap Video
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Video Player & Frame Analysis */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex-1 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 sm:p-6 relative overflow-hidden flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-medium text-slate-300">
                  Video Player & Frame Stream
                </span>
              </div>
              {videoUrl && (
                <span className="text-xs text-slate-400">
                  Ready
                </span>
              )}
            </div>

            {/* Video Player Display */}
            <div className="py-4 flex flex-col items-center justify-center min-h-[260px] relative">
              {videoUrl ? (
                <div className="w-full space-y-4">
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-[300px] mx-auto flex items-center justify-center border border-slate-800 shadow-xl">
                    <video
                      ref={videoElementRef}
                      src={videoUrl}
                      controls
                      className={`w-full h-full object-contain transition-all duration-300 ${
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
                          {/* Straight Solid White & Neon Cyan Laser Line */}
                          <motion.div
                            initial={{ top: "0%" }}
                            animate={{ top: "100%" }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="laser-line-video"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {previewFrame && (
                    <div className="flex items-center gap-3 p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-cyan-500/30 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={previewFrame}
                          alt="Analyzed Keyframe"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-xs">
                        <p className="font-semibold text-slate-200">Sampled Keyframe Analyzed</p>
                        <p className="text-xs text-slate-400">
                          Checked for temporal boundary blending and facial manipulation
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Film className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-400">No video stream loaded</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload a video or select a sample to inspect
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
                      {result.is_real ? "Authentic Video Stream Verified" : "AI Deepfake Video Detected"}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {result.is_real 
                        ? "Natural frame consistency confirmed across keyframes" 
                        : "Facial manipulation or generative frame blending detected"}
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
                      <CheckCircle2 className="w-3.5 h-3.5" /> Authentic Video Probability
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
                      <AlertTriangle className="w-3.5 h-3.5" /> Deepfake Video Probability
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
              modality="video"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
