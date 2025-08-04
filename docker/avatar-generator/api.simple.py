import os
import requests
import subprocess
import tempfile
from flask import Flask, request, jsonify

app = Flask(__name__)

# ElevenLabs configuration
ELEVENLABS_API_KEY = os.getenv('ELEVENLABS_API_KEY', '')
ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1'

# EchoMimic configuration
ECHOMIMIC_ENABLED = os.getenv('ECHOMIMIC_ENABLED', 'false').lower() == 'true'
REFERENCE_VIDEO_PATH = '/app/input/reference_presenter.mp4'

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'avatar-generator-elevenlabs'})

@app.route('/voices', methods=['GET'])
def list_voices():
    """List available ElevenLabs voices"""
    try:
        if not ELEVENLABS_API_KEY:
            return jsonify({'error': 'ElevenLabs API key not configured'}), 400
            
        url = f"{ELEVENLABS_BASE_URL}/voices"
        headers = {"xi-api-key": ELEVENLABS_API_KEY}
        
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            voices_data = response.json()
            voices = []
            for voice in voices_data.get('voices', []):
                voices.append({
                    'voice_id': voice['voice_id'],
                    'name': voice['name'],
                    'category': voice.get('category', 'unknown')
                })
            
            return jsonify({
                'success': True,
                'voices': voices
            })
        else:
            return jsonify({'error': f'Failed to fetch voices: {response.text}'}), 500
            
    except Exception as e:
        return jsonify({'error': f'Error fetching voices: {str(e)}'}), 500

@app.route('/clone-voice', methods=['POST'])
def clone_voice():
    """Clone a voice using uploaded audio file"""
    try:
        if not ELEVENLABS_API_KEY:
            return jsonify({'error': 'ElevenLabs API key not configured'}), 400
            
        # This would handle file upload for voice cloning
        # For now, return instructions
        return jsonify({
            'success': False,
            'message': 'Voice cloning requires file upload. Use ElevenLabs web interface to clone your voice first, then use the voice_id here.',
            'instructions': [
                '1. Go to ElevenLabs.io',
                '2. Upload your voice sample (30-60 seconds)',
                '3. Create a cloned voice',
                '4. Copy the voice_id',
                '5. Use that voice_id in the generate-speech endpoint'
            ]
        })
        
    except Exception as e:
        return jsonify({'error': f'Voice cloning failed: {str(e)}'}), 500

@app.route('/generate-speech', methods=['POST'])
def generate_speech():
    """Generate speech using ElevenLabs TTS"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        voice_id = data.get('voice_id', 'default')
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400

        if not ELEVENLABS_API_KEY:
            # Fallback to mock for testing
            return jsonify({
                'success': True,
                'audio_path': '/app/generated_audio/mock_audio.wav',
                'message': 'Mock speech generated (no ElevenLabs API key)'
            })

        # Generate speech with ElevenLabs
        audio_data = generate_elevenlabs_speech(text, voice_id)
        
        if audio_data:
            # Save audio file
            audio_filename = f"speech_{hash(text) % 10000}.wav"
            audio_path = f"/app/generated_audio/{audio_filename}"
            
            os.makedirs('/app/generated_audio', exist_ok=True)
            with open(audio_path, 'wb') as f:
                f.write(audio_data)
            
            return jsonify({
                'success': True,
                'audio_path': audio_path,
                'message': 'Speech generated successfully with ElevenLabs'
            })
        else:
            return jsonify({'error': 'Failed to generate speech'}), 500
        
    except Exception as e:
        return jsonify({'error': f'Speech generation failed: {str(e)}'}), 500

def generate_elevenlabs_speech(text, voice_id):
    """Generate speech using ElevenLabs API"""
    try:
        url = f"{ELEVENLABS_BASE_URL}/text-to-speech/{voice_id}"
        
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY
        }
        
        data = {
            "text": text,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.5
            }
        }
        
        response = requests.post(url, json=data, headers=headers)
        
        if response.status_code == 200:
            return response.content
        else:
            print(f"ElevenLabs API error: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"Error calling ElevenLabs API: {str(e)}")
        return None

@app.route('/generate-video', methods=['POST'])
def generate_video():
    """Generate video using EchoMimic V2 or fallback to mock"""
    try:
        data = request.get_json()
        audio_path = data.get('audio_path')
        output_path = data.get('output_path', '/app/output/generated_video.mp4')
        reference_video = data.get('reference_video', REFERENCE_VIDEO_PATH)
        
        if not audio_path:
            return jsonify({'error': 'Audio path is required'}), 400

        # Check if we have real audio and base video
        if os.path.exists('/app/input/rohan_base.mp4') and audio_path != '/app/generated_audio/mock_audio.wav':
            # Use real audio + base video combination
            video_data = combine_audio_with_base_video(audio_path, '/app/input/rohan_base.mp4', output_path)
            
            if video_data:
                return jsonify({
                    'success': True,
                    'video_path': output_path,
                    'message': 'Video generated successfully with ElevenLabs audio + base video'
                })
            else:
                return jsonify({'error': 'Audio+Video combination failed'}), 500
        else:
            # Fallback to mock response
            return jsonify({
                'success': True,
                'video_path': output_path,
                'message': 'Mock video generated (no real audio or base video missing)'
            })
        
    except Exception as e:
        return jsonify({'error': f'Video generation failed: {str(e)}'}), 500

def combine_audio_with_base_video(audio_path, base_video_path, output_path):
    """Combine ElevenLabs audio with base video using FFmpeg"""
    try:
        # Use FFmpeg to combine audio with video
        cmd = [
            'ffmpeg', '-y',  # -y to overwrite output file
            '-i', base_video_path,  # Input video
            '-i', audio_path,       # Input audio
            '-c:v', 'copy',         # Copy video stream as-is
            '-c:a', 'aac',          # Encode audio as AAC
            '-shortest',            # Stop when shortest stream ends
            output_path
        ]
        
        print(f"Running FFmpeg command: {' '.join(cmd)}")
        
        # Run FFmpeg command
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0 and os.path.exists(output_path):
            print(f"Successfully created video: {output_path}")
            return True
        else:
            print(f"FFmpeg error: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"Error combining audio with video: {str(e)}")
        return False

def torch_available():
    """Check if PyTorch is available"""
    try:
        import torch
        return torch.cuda.is_available()
    except ImportError:
        return False

@app.route('/generate', methods=['POST'])
def generate_complete():
    """Mock complete pipeline for testing"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        output_name = data.get('output_name', 'mock_video.mp4')
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400

        # Mock response
        return jsonify({
            'success': True,
            'video_path': f'/app/output/{output_name}',
            'message': 'Mock avatar generated successfully'
        })
        
    except Exception as e:
        return jsonify({'error': f'Complete generation failed: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8001, debug=True)