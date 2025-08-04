
import os
import sys
import json
from flask import Flask, request, jsonify
import subprocess
import tempfile

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'echomimic-v2'})

@app.route('/generate-avatar', methods=['POST'])
def generate_avatar():
    """Generate avatar video using EchoMimic V2"""
    try:
        data = request.get_json()
        audio_path = data.get('audio_path')
        reference_video = data.get('reference_video', '/app/input/reference.mp4')
        output_path = data.get('output_path', '/app/output/generated.mp4')
        
        if not audio_path:
            return jsonify({'error': 'Audio path is required'}), 400
            
        # Run EchoMimic inference
        cmd = [
            'python', '/app/echomimic/inference.py',
            '--reference_video', reference_video,
            '--audio_path', audio_path,
            '--output_path', output_path
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            return jsonify({
                'success': True,
                'video_path': output_path,
                'message': 'Avatar generated successfully'
            })
        else:
            return jsonify({
                'error': f'Generation failed: {result.stderr}'
            }), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8003, debug=True)
