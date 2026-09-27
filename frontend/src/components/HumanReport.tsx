"use client";

import React from "react";
import { 
  CheckCircle2, 
  FileText, 
  Camera, 
  Layers, 
  Activity, 
  Cpu, 
  Search,
  ShieldCheck,
  ShieldAlert
} from "lucide-react";

interface HumanReportProps {
  reportMarkdown: string;
  isReal: boolean;
  confidence: number;
  modality: "image" | "audio" | "video";
}

export function HumanReport({ reportMarkdown, isReal, confidence, modality }: HumanReportProps) {
  // Parse lines cleanly without robotic symbols and AI tags
  const cleanLines = reportMarkdown
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith("#") && !line.startsWith("---"));

  // Extract key descriptive sentences
  const findings: string[] = [];
  const technicalDetails: { title: string; detail: string; status: "good" | "alert" | "neutral" }[] = [];

  cleanLines.forEach(line => {
    // Strip markdown formatting symbols like *, `, -, emojis
    const cleaned = line
      .replace(/^[\*\-\•\–\—\s]+/, "")
      .replace(/[\`\*]/g, "")
      .replace(/[🟢🔴⚠️🛡️📸⚡🔍🔍?]/g, "")
      .trim();

    if (!cleaned) return;

    if (cleaned.toLowerCase().includes("overall confidence") || cleaned.toLowerCase().includes("verdict")) {
      return;
    }

    if (cleaned.includes(":")) {
      const parts = cleaned.split(":");
      const title = parts[0].trim();
      const detail = parts.slice(1).join(":").trim();

      if (!detail) return;

      let status: "good" | "alert" | "neutral" = "neutral";
      const lowerDetail = detail.toLowerCase();

      // Check authentic / genuine indicators first
      if (
        lowerDetail.includes("no synthetic") || 
        lowerDetail.includes("no ai") ||
        lowerDetail.includes("natural") || 
        lowerDetail.includes("genuine") || 
        lowerDetail.includes("authentic") || 
        lowerDetail.includes("verified") ||
        lowerDetail.includes("human/real") ||
        lowerDetail.includes("galaxy") ||
        lowerDetail.includes("iphone") ||
        lowerDetail.includes("camera hardware")
      ) {
        status = "good";
      } else if (
        lowerDetail.includes("ai origin") || 
        lowerDetail.includes("grok") ||
        lowerDetail.includes("dall-e") ||
        lowerDetail.includes("midjourney") ||
        lowerDetail.includes("synthetic c2pa") ||
        lowerDetail.includes("inpainting") ||
        lowerDetail.includes("voice clone") ||
        lowerDetail.includes("spoof") ||
        lowerDetail.includes("face swap") ||
        (lowerDetail.includes("synthetic") && !lowerDetail.includes("no synthetic"))
      ) {
        status = "alert";
      }

      technicalDetails.push({ title, detail, status });
    } else {
      findings.push(cleaned);
    }
  });

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-6">
      {/* Report Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isReal ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}>
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100">
              Forensic Audit Summary
            </h4>
            <p className="text-xs text-slate-400">
              {modality === "image" ? "Optical sensor, compression and neural token inspection" : modality === "audio" ? "Spectrogram frequency and voice synthesis inspection" : "Temporal stream and keyframe consistency inspection"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
            isReal ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/40" : "bg-red-950/60 text-red-300 border border-red-800/40"
          }`}>
            {isReal ? "Verified Original" : "Synthetic Manipulation"}
          </span>
        </div>
      </div>

      {/* Human-written Overview Paragraph */}
      <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-4 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2">
        <p className="font-medium text-slate-200">
          {isReal 
            ? `Inspection confirms this ${modality} exhibits genuine physical capture characteristics with ${confidence.toFixed(1)}% confidence. No generative neural synthesis signatures or digital manipulation containers were observed.`
            : `Inspection detected definitive markers of artificial generation or synthetic editing with ${confidence.toFixed(1)}% confidence. The media contains latent diffusion patterns, neural synthesis artifacts, or provenance metadata characteristic of AI generation.`
          }
        </p>
      </div>

      {/* Structured Technical Findings Grid */}
      {technicalDetails.length > 0 && (
        <div className="space-y-3">
          <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Key Inspection Points
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {technicalDetails.map((item, idx) => (
              <div 
                key={idx}
                className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3.5 space-y-1.5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">{item.title}</span>
                  {item.status === "good" ? (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified</span>
                    </span>
                  ) : item.status === "alert" ? (
                    <span className="text-[11px] font-medium text-red-400 bg-red-950/40 border border-red-800/40 px-2 py-0.5 rounded-md">
                      Flagged
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-mono">
                      Info
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-200">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Observations Paragraphs */}
      {findings.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-800/60">
          <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Technical Observations
          </h5>
          <div className="space-y-2">
            {findings.map((finding, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <span>{finding}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
