
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    ffmpeg \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Clone EchoMimic V2
RUN git clone https://github.com/BadToBest/EchoMimic.git echomimic

WORKDIR /app/echomimic

# Install Python dependencies
RUN pip install --no-cache-dir \
    torch torchvision torchaudio \
    opencv-python \
    pillow \
    numpy \
    scipy \
    librosa \
    soundfile \
    tqdm \
    omegaconf \
    diffusers \
    transformers \
    accelerate

# Download models (this would be done in a real setup)
RUN mkdir -p models

# Copy our API integration
COPY echomimic_api.py /app/echomimic_api.py

WORKDIR /app

EXPOSE 8003

CMD ["python", "echomimic_api.py"]
