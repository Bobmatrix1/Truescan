"""
FastAPI Backend Server for Multi-Modal AI Deepfake & Media Forensics
Wraps forensics.py and provides high-performance JSON & visual inspection endpoints.
"""

import os
import io
import base64
import asyncio
import tempfile
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
import forensics

app = FastAPI(title="Deepfake Forensics API", version="2.0.0")

# Enable CORS for Next.js frontend (production & local)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Global exception handler ensuring CORS headers are always present on errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": f"Internal Server Error: {str(exc)}"},
        headers={"Access-Control-Allow-Origin": "*"}
    )

# Serve sample media directories
if os.path.exists("images"):
    app.mount("/images", StaticFiles(directory="images"), name="images")
if os.path.exists("audios"):
    app.mount("/audios", StaticFiles(directory="audios"), name="audios")
if os.path.exists("videos"):
    app.mount("/videos", StaticFiles(directory="videos"), name="videos")

def pil_to_base64(pil_image: Image.Image) -> str:
    """Converts a PIL Image to a lightweight Base64 JPEG data URI string."""
    if pil_image is None:
        return ""
    try:
        buffered = io.BytesIO()
        w, h = pil_image.size
        if max(w, h) > 768:
            scale = 768.0 / max(w, h)
            thumb = pil_image.resize((int(w * scale), int(h * scale)), Image.Resampling.BILINEAR)
        else:
            thumb = pil_image
            
        thumb.convert("RGB").save(buffered, format="JPEG", quality=80)
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        return f"data:image/jpeg;base64,{img_str}"
    except Exception:
        return ""


def parse_report_metrics(report_text: str):
    """Parses key statistics out of the markdown report."""
    is_real = "🟢" in report_text or "AUTHENTIC" in report_text
    
    # Extract confidence score
    confidence = 50.0
    for line in report_text.splitlines():
        if "Overall Confidence:" in line or "Confidence Score:" in line:
            try:
                conf_str = line.split("`")[1].replace("%", "").strip()
                confidence = float(conf_str)
            except Exception:
                pass
                
    real_prob = confidence if is_real else round(100.0 - confidence, 2)
    fake_prob = round(100.0 - confidence, 2) if is_real else confidence
    
    return {
        "is_real": is_real,
        "verdict": "AUTHENTIC REAL" if is_real else "AI-GENERATED / DEEPFAKE",
        "confidence": confidence,
        "probability_real": real_prob,
        "probability_fake": fake_prob,
        "report_markdown": report_text
    }


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "2.0.0",
        "inference_mode": "cloud_serverless_and_signals",
        "models": {
            "huggingface_image_vit": "active_serverless",
            "huggingface_audio_ast": "active_serverless",
            "c2pa_provenance": "active",
            "frequency_fft_ela": "active"
        }
    }


@app.post("/api/analyze/image")
async def analyze_image_endpoint(file: UploadFile = File(...)):
    """Analyze image authenticity for DALL-E, Grok, Midjourney, SDXL, Inpainting & Real Photos."""
    if not file:
        raise HTTPException(status_code=400, detail="No image file provided.")
        
    temp_path = None
    try:
        suffix = os.path.splitext(file.filename)[1] or ".jpg"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            content = await file.read()
            tmp.write(content)
            temp_path = tmp.name
            
        report, ela_img, fft_img = await asyncio.to_thread(forensics.analyze_image, temp_path)
        metrics = parse_report_metrics(report)
        
        return {
            "success": True,
            "filename": file.filename,
            "metrics": metrics,
            "visualizations": {
                "ela_image": pil_to_base64(ela_img),
                "fft_spectrum": pil_to_base64(fft_img)
            }
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass


@app.post("/api/analyze/audio")
async def analyze_audio_endpoint(file: UploadFile = File(...)):
    """Analyze audio voice authenticity for AI voice clones & synthetic vocoders."""
    if not file:
        raise HTTPException(status_code=400, detail="No audio file provided.")
        
    temp_path = None
    try:
        suffix = os.path.splitext(file.filename)[1] or ".wav"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            content = await file.read()
            tmp.write(content)
            temp_path = tmp.name
            
        report = await asyncio.to_thread(forensics.analyze_audio, temp_path)
        metrics = parse_report_metrics(report)
        
        return {
            "success": True,
            "filename": file.filename,
            "metrics": metrics
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass


@app.post("/api/analyze/video")
async def analyze_video_endpoint(file: UploadFile = File(...)):
    """Analyze video for face swaps, deepfake artifacts & temporal flicker."""
    if not file:
        raise HTTPException(status_code=400, detail="No video file provided.")
        
    temp_path = None
    try:
        suffix = os.path.splitext(file.filename)[1] or ".mp4"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            content = await file.read()
            tmp.write(content)
            temp_path = tmp.name
            
        report, preview_img = await asyncio.to_thread(forensics.analyze_video, temp_path)
        metrics = parse_report_metrics(report)
        
        return {
            "success": True,
            "filename": file.filename,
            "metrics": metrics,
            "visualizations": {
                "preview_frame": pil_to_base64(preview_img)
            }
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass


@app.post("/api/analyze/sample")
async def analyze_sample_endpoint(sample_path: str):
    """Analyze a predefined workspace sample file directly."""
    clean_path = sample_path.strip().lstrip("/\\")
    target_path = None
    
    if os.path.exists(clean_path):
        target_path = clean_path
    elif os.path.exists(sample_path):
        target_path = sample_path
    else:
        raise HTTPException(status_code=404, detail=f"Sample file not found: {sample_path}")
        
    ext = os.path.splitext(target_path)[1].lower()
    if ext in ['.jpg', '.jpeg', '.png', '.webp']:
        report, ela_img, fft_img = await asyncio.to_thread(forensics.analyze_image, target_path)
        metrics = parse_report_metrics(report)
        return {
            "success": True,
            "type": "image",
            "filename": os.path.basename(target_path),
            "metrics": metrics,
            "visualizations": {
                "ela_image": pil_to_base64(ela_img),
                "fft_spectrum": pil_to_base64(fft_img)
            }
        }
    elif ext in ['.flac', '.wav', '.mp3', '.ogg', '.m4a']:
        report = await asyncio.to_thread(forensics.analyze_audio, target_path)
        metrics = parse_report_metrics(report)
        return {
            "success": True,
            "type": "audio",
            "filename": os.path.basename(target_path),
            "metrics": metrics
        }
    elif ext in ['.mp4', '.mov', '.avi', '.webm']:
        report, preview_img = await asyncio.to_thread(forensics.analyze_video, target_path)
        metrics = parse_report_metrics(report)
        return {
            "success": True,
            "type": "video",
            "filename": os.path.basename(target_path),
            "metrics": metrics,
            "visualizations": {
                "preview_frame": pil_to_base64(preview_img)
            }
        }
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
