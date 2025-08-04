import os
import tempfile
from flask import Flask, request, jsonify
from TTS.api import TTS
import subprocess
import torch

app = Flask(__name__)

# Initialize TTS with YourTTS model
device = "cuda" if torch.cuda.is_available() else "cpu"
tts = TTS("tts_models/multilingual/multi-dataset/your_tts").to(device)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'avatar-generator'})

@app.route('/generate-speech', methods=['POST'])
def generate_speech():
    """Generate speech from text using YourTTS"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        speaker_wav = data.get('speaker_wav', '/app/input/rohan_voice_sample.wav')
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400

        # Generate audio using YourTTS
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_file:
            audio_path = tmp_file.name
            
        # Use YourTTS for voice cloning
        tts.tts_to_file(
            text=text,
            speaker_wav=speaker_wav,
            language="en",
            file_path=audio_path
        )
        
        return jsonify({
            'success': True,
            'audio_path': audio_path,
            'message': 'Speech generated successfully'
        })
        
    except Exception as e:
        return jsonify({'error': f'TTS generation failed: {str(e)}'}), 500

@app.route('/generate-video', methods=['POST'])
def generate_video():
    """Generate lip-sync video using Wav2Lip"""
    try:
        data = request.get_json()
        audio_path = data.get('audio_path')
        face_video = data.get('face_video', '/app/input/rohan_base.mp4')
        output_path = data.get('output_path', '/app/output/generated_video.mp4')
        
        if not audio_path:
            return jsonify({'error': 'Audio path is required'}), 400

        # Ensure output directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Run Wav2Lip
        wav2lip_command = [
            'python', '/app/Wav2Lip/inference.py',
            '--checkpoint_path', '/app/Wav2Lip/checkpoints/Wav2Lip_GAN.pth',
            '--face', face_video,
            '--audio', audio_path,
            '--outfile', output_path
        ]
        
        result = subprocess.run(wav2lip_command, capture_output=True, text=True)
        
        if result.returncode != 0:
            return jsonify({'error': f'Wav2Lip failed: {result.stderr}'}), 500
            
        return jsonify({
            'success': True,
            'video_path': output_path,
            'message': 'Video generated successfully'
        })
        
    except Exception as e:
        return jsonify({'error': f'Video generation failed: {str(e)}'}), 500

@app.route('/generate', methods=['POST'])
def generate_complete():
    """Complete pipeline: text -> speech -> video"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        output_name = data.get('output_name', 'generated_video.mp4')
        speaker_wav = data.get('speaker_wav', '/app/input/rohan_voice_sample.wav')
        face_video = data.get('face_video', '/app/input/rohan_base.mp4')
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400

        # Step 1: Generate speech
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_audio:
            audio_path = tmp_audio.name
            
        tts.tts_to_file(
            text=text,
            speaker_wav=speaker_wav,
            language="en",
            file_path=audio_path
        )
        
        # Step 2: Generate video
        output_path = f'/app/output/{output_name}'
        os.makedirs('/app/output', exist_ok=True)
        
        wav2lip_command = [
            'python', '/app/Wav2Lip/inference.py',
            '--checkpoint_path', '/app/Wav2Lip/checkpoints/Wav2Lip_GAN.pth',
            '--face', face_video,
            '--audio', audio_path,
            '--outfile', output_path
        ]
        
        result = subprocess.run(wav2lip_command, capture_output=True, text=True)
        
        # Clean up temporary audio file
        os.unlink(audio_path)
        
        if result.returncode != 0:
            return jsonify({'error': f'Wav2Lip failed: {result.stderr}'}), 500
            
        return jsonify({
            'success': True,
            'video_path': output_path,
            'message': 'Avatar generated successfully'
        })
        
    except Exception as e:
        return jsonify({'error': f'Complete generation failed: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8001, debug=True)
