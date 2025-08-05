#!/usr/bin/env python3

import os
import requests
import json
from pathlib import Path

def download_file(url, filepath):
    """Download a file from URL to filepath"""
    print(f"📥 Downloading: {filepath.name}")
    
    response = requests.get(url, stream=True)
    response.raise_for_status()
    
    # Create directory if it doesn't exist
    filepath.parent.mkdir(parents=True, exist_ok=True)
    
    with open(filepath, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    
    print(f"✅ Downloaded: {filepath.name}")

def main():
    # Create models directory
    models_dir = Path(__file__).parent.parent / "public" / "models" / "whisper-tiny-en"
    models_dir.mkdir(parents=True, exist_ok=True)
    
    # Whisper tiny.en model files from Hugging Face
    model_files = [
        'config.json',
        'generation_config.json',
        'merges.txt',
        'normalizer.json',
        'preprocessor_config.json',
        'tokenizer.json',
        'tokenizer_config.json',
        'vocab.json',
        'onnx/decoder_model_merged.onnx',
        'onnx/encoder_model.onnx'
    ]
    
    base_url = 'https://huggingface.co/Xenova/whisper-tiny.en/resolve/main/'
    
    print('🚀 Starting Whisper model download...')
    
    for file in model_files:
        url = base_url + file
        filepath = models_dir / file
        
        try:
            download_file(url, filepath)
        except Exception as e:
            print(f"❌ Failed to download {file}: {e}")
            return 1
    
    print('🎉 All model files downloaded successfully!')
    print(f'📁 Model location: {models_dir}')
    
    # Create a simple index file to verify the model is available
    index_data = {
        "model_name": "whisper-tiny.en",
        "files": model_files,
        "downloaded_at": "2025-01-08"
    }
    
    with open(models_dir / "index.json", 'w') as f:
        json.dump(index_data, f, indent=2)
    
    return 0

if __name__ == "__main__":
    exit(main())