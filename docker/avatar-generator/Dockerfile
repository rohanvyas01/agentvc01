# Avatar Generator Docker Setup (YourTTS + Wav2Lip)

# --- Builder Stage ---
# Use a more recent Python version with better network support
FROM python:3.9-slim as builder

WORKDIR /app

# Install build-time dependencies with better network handling
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    git \
    wget \
    build-essential \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip and install python dependencies in a target directory
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir --prefix="/install" TTS scipy

# Clone Wav2Lip, install its dependencies, and then clean up the git repo
RUN git clone https://github.com/Rudrabha/Wav2Lip.git /app/Wav2Lip && \
    pip install --no-cache-dir --prefix="/install" -r /app/Wav2Lip/requirements.txt && \
    rm -rf /app/Wav2Lip/.git

# Download Wav2Lip pretrained model
RUN mkdir -p /app/Wav2Lip/checkpoints && \
    wget 'https://www.adrianbulat.com/downloads/python-fan/Wav2Lip_GAN.pth' -O /app/Wav2Lip/checkpoints/Wav2Lip_GAN.pth

# --- Final Stage ---
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies with better network handling
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ffmpeg \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libsndfile1 \
    build-essential \
    gcc \
    g++ && \
    rm -rf /var/lib/apt/lists/*

# Copy installed packages, application code, and models from the builder stage
COPY --from=builder /install /usr/local
COPY --from=builder /app/Wav2Lip /app/Wav2Lip

# Copy our API server
COPY api.py /app/api.py

# Create directories
RUN mkdir -p /app/input /app/generated_audio /app/output

EXPOSE 8001

# Start the API server
CMD ["python", "api.py"]
