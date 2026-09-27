import gradio as gr
import forensics

custom_css = """
.container { max-width: 1100px; margin: auto; padding-top: 10px; }
.header-box { text-align: center; margin-bottom: 20px; }
.header-title { font-size: 2.2rem; font-weight: 800; color: #1E293B; margin-bottom: 6px; }
.header-subtitle { font-size: 1.05rem; color: #64748B; margin-bottom: 12px; }
.badge { display: inline-block; padding: 5px 14px; border-radius: 9999px; font-weight: 600; font-size: 0.85rem; }
.badge-blue { background-color: #DBEAFE; color: #1E40AF; }
"""

with gr.Blocks(title="AI Deepfake & Synthetic Media Detector") as app:
    with gr.Column(elem_classes=["container"]):
        with gr.Column(elem_classes=["header-box"]):
            gr.Markdown(
                """
                # 🛡️ AI Deepfake & Synthetic Media Detector
                ### Multi-Angle Forensics for Images, Videos & Audio (Authentic vs AI-Generated)
                
                <span class="badge badge-blue">⚡ C2PA Provenance + Vision Transformers + Audio Spectrogram Transformers + 2D-FFT + ELA</span>
                """
            )
        
        with gr.Tabs():
            # ==========================================
            # TAB 1: IMAGE DETECTION
            # ==========================================
            with gr.TabItem("🖼️ Image Detection"):
                gr.Markdown("Upload any photo or image (Real Camera Photo, Grok, ChatGPT, Gemini, Midjourney, Stable Diffusion, or Inpainting/Deepfakes) to detect authenticity.")
                with gr.Row():
                    with gr.Column(scale=1):
                        image_input = gr.Image(type="filepath", label="Input Image")
                        with gr.Row():
                            image_clear = gr.Button("🗑️ Clear", variant="secondary")
                            image_submit = gr.Button("🚀 Submit Analysis", variant="primary")
                        
                        gr.Examples(
                            examples=[["images/real image.jpeg"], ["images/deepfake image.jpeg"]],
                            inputs=image_input,
                            label="Sample Test Images"
                        )
                    with gr.Column(scale=1):
                        image_report = gr.Markdown(label="Forensics Report", value="*Upload an image and click Submit to run forensic analysis.*")
                        with gr.Row():
                            image_ela = gr.Image(type="pil", label="ELA Compression Map")
                            image_fft = gr.Image(type="pil", label="2D-FFT Power Spectrum")
                
                # Submit Action
                image_submit.click(
                    fn=forensics.analyze_image,
                    inputs=image_input,
                    outputs=[image_report, image_ela, image_fft]
                )
                
                # Clear Action
                image_clear.click(
                    fn=lambda: (None, "*Upload an image and click Submit to run forensic analysis.*", None, None),
                    inputs=None,
                    outputs=[image_input, image_report, image_ela, image_fft]
                )
                
            # ==========================================
            # TAB 2: VIDEO DETECTION
            # ==========================================
            with gr.TabItem("🎬 Video Detection"):
                gr.Markdown("Upload a video to detect AI face swaps, temporal generative incoherence, and deepfake manipulations.")
                with gr.Row():
                    with gr.Column(scale=1):
                        video_input = gr.Video(label="Input Video")
                        with gr.Row():
                            video_clear = gr.Button("🗑️ Clear", variant="secondary")
                            video_submit = gr.Button("🚀 Submit Video", variant="primary")
                        
                        gr.Examples(
                            examples=[["videos/real-1.mp4"], ["videos/aaa.mp4"]],
                            inputs=video_input,
                            label="Sample Test Videos"
                        )
                    with gr.Column(scale=1):
                        video_report = gr.Markdown(label="Video Forensics Report", value="*Upload a video and click Submit to run forensic analysis.*")
                        video_preview = gr.Image(type="pil", label="Sampled Keyframe")
                
                # Submit Action
                video_submit.click(
                    fn=forensics.analyze_video,
                    inputs=video_input,
                    outputs=[video_report, video_preview]
                )
                
                # Clear Action
                video_clear.click(
                    fn=lambda: (None, "*Upload a video and click Submit to run forensic analysis.*", None),
                    inputs=None,
                    outputs=[video_input, video_report, video_preview]
                )
                
            # ==========================================
            # TAB 3: AUDIO DETECTION
            # ==========================================
            with gr.TabItem("🎵 Audio Detection"):
                gr.Markdown("Upload an audio recording or speak into the microphone to detect synthetic AI voices, voice clones, and vocoder artifacts.")
                with gr.Row():
                    with gr.Column(scale=1):
                        audio_input = gr.Audio(label="Input Audio File / Microphone")
                        with gr.Row():
                            audio_clear = gr.Button("🗑️ Clear", variant="secondary")
                            audio_submit = gr.Button("🚀 Submit Audio", variant="primary")
                        
                        gr.Examples(
                            examples=[["audios/DF_E_2000031.flac"], ["audios/DF_E_2000027.flac"]],
                            inputs=audio_input,
                            label="Sample Test Audios"
                        )
                    with gr.Column(scale=1):
                        audio_report = gr.Markdown(label="Acoustic Forensics Report", value="*Upload an audio file and click Submit to run acoustic analysis.*")
                
                # Submit Action
                audio_submit.click(
                    fn=forensics.analyze_audio,
                    inputs=audio_input,
                    outputs=[audio_report]
                )
                
                # Clear Action
                audio_clear.click(
                    fn=lambda: (None, "*Upload an audio file and click Submit to run acoustic analysis.*"),
                    inputs=None,
                    outputs=[audio_input, audio_report]
                )

if __name__ == '__main__':
    app.launch(share=False, server_name="127.0.0.1", server_port=7860, css=custom_css)
