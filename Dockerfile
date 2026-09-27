FROM python:3.10-slim

WORKDIR /app

# Install system audio and image dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu torch torchvision torchaudio && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

ENV OMP_NUM_THREADS=1
ENV MKL_NUM_THREADS=1
ENV WEB_CONCURRENCY=1

CMD ["python", "-m", "uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
