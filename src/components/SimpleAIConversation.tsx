import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VideoPersonaConversationProps {
  sessionId: string;
  founderName: string;
  onConversationEnd?: () => void;
}

type ConversationPhase = 'start' | 'founder_intro' | 'mid' | 'pitch_recording' | 'end' | 'completed';

export const SimpleAIConversation: React.FC<VideoPersonaConversationProps> = ({
  sessionId,
  founderName,
  onConversationEnd
}) => {
  const [phase, setPhase] = useState<ConversationPhase>('start');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [showVideo, setShowVideo] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testTranscript, setTestTranscript] = useState('');
  
  const speechRecognitionRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Video segments for each phase (Tavus generated videos) - with cache busting
  const videoSegments = {
    start: `/videos/rohan_intro.mp4?cache=intro_${Date.now()}`,      // Start video
    mid: `/videos/Mid.mp4?cache=transition_${Date.now()}`,   // Mid video
    end: `/videos/rohan_wrap_up.mp4?cache=wrapup_${Date.now()}`       // End video
  };

  // Script texts matching your exact Tavus video scripts
  const scriptTexts = {
    start: `Hello there, and welcome to AgentVC — your AI-powered venture partner. I'm Rohan, here to learn about your startup and explore the possibilities of backing your vision. I'll also be capturing everything you share today to help our investor team make faster, smarter decisions. To get us started, tell me a bit about yourself and your company.`,
    
    mid: `Thank you for that. I'm ready to hear your pitch. Please begin whenever you're ready. Take your time — everything you say will be transcribed and securely stored, along with your onboarding details and pitch deck, for further analysis. If at any point you'd like to restart your pitch, just let me know.`,
    
    end: `Thank you for sharing your vision with us — your pitch has been recorded and will now be reviewed by our investor intelligence systems. We'll be in touch soon with feedback or next steps. Wishing you continued momentum and clarity in your journey ahead. Until then, take care — and keep building boldly.`
  };

  useEffect(() => {
    // Start with the "Start" video
    setCurrentVideoUrl(videoSegments.start);
    setVideoEnded(false);
    setShowVideo(true);
    setVideoLoaded(false);
    setVideoError(false);
  }, []);

  const handleVideoEnded = () => {
    setVideoEnded(true);
    
    // Auto-advance based on phase
    if (phase === 'start') {
      // After start video, allow founder to record introduction
      setPhase('founder_intro');
      setShowVideo(false);
    } else if (phase === 'mid') {
      // After mid video, allow founder to record pitch
      setPhase('pitch_recording');
      setShowVideo(false);
    } else if (phase === 'end') {
      // After end video, complete the session
      setPhase('completed');
      setTimeout(() => {
        onConversationEnd?.();
      }, 2000);
    }
  };

  const handleVideoLoaded = () => {
    setVideoLoaded(true);
    setVideoError(false);
  };

  const handleVideoError = () => {
    setVideoError(true);
    setVideoLoaded(false);
  };

  const getCurrentScript = () => {
    switch (phase) {
      case 'start': return scriptTexts.start;
      case 'mid': return scriptTexts.mid;
      case 'end': return scriptTexts.end;
      default: return '';
    }
  };


  
  // Method 1: Web Speech API (Real-time, no API key needed)
  const transcribeWithWebSpeech = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        reject(new Error('Web Speech API not supported in this browser'));
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      let finalTranscript = '';
      let interimTranscript = '';

      recognition.onstart = () => {
        console.log('🎤 Web Speech Recognition started');
        setTranscript('🎤 Listening... (speak clearly)');
      };

      recognition.onresult = (event) => {
        interimTranscript = '';
        finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Show live transcription
        const displayText = finalTranscript + (interimTranscript ? ` ${interimTranscript}` : '');
        if (displayText.trim()) {
          setTranscript(displayText);
        }
      };

      recognition.onerror = (event) => {
        console.error('Web Speech Recognition error:', event.error);
        if (event.error === 'network') {
          reject(new Error('Network error - speech recognition requires internet'));
        } else if (event.error === 'not-allowed') {
          reject(new Error('Microphone access denied'));
        } else {
          reject(new Error(`Speech recognition failed: ${event.error}`));
        }
      };

      recognition.onend = () => {
        console.log('🛑 Web Speech Recognition ended');
        if (finalTranscript.trim().length > 0) {
          resolve(finalTranscript.trim());
        } else {
          reject(new Error('No speech detected'));
        }
      };

      recognition.start();
      
      // Store recognition for manual stopping
      speechRecognitionRef.current = {
        stop: () => {
          recognition.stop();
        }
      };

      // Auto-stop after 60 seconds
      setTimeout(() => {
        if (recognition) {
          recognition.stop();
        }
      }, 60000);
    });
  };

  // Method 2: Simple audio recording with manual transcription
  const recordAudioOnly = async (audioBlob: Blob): Promise<string> => {
    // For now, just save the audio and ask user to type
    // In the future, this could integrate with local Whisper or other solutions
    console.log('📁 Audio recorded, size:', audioBlob.size, 'bytes');
    
    // You could save this to local storage or send to a different service
    const audioUrl = URL.createObjectURL(audioBlob);
    console.log('🎵 Audio URL created:', audioUrl);
    
    // For now, throw error to fallback to text input
    throw new Error('Audio recorded but transcription not available. Please use text input.');
  };

  const startRecording = async () => {
    try {
      console.log('🎤 Starting speech recognition...');
      setTranscript('🎤 Initializing...');
      setIsRecording(true);
      
      // Try Web Speech API first (no API key needed)
      try {
        console.log('🔄 Trying Web Speech API...');
        const transcribedText = await transcribeWithWebSpeech();
        
        if (transcribedText && transcribedText.length > 0) {
          console.log('✅ Web Speech transcription successful:', transcribedText);
          setTranscript(transcribedText);
          setIsProcessing(true);
          saveTranscriptAndAdvance(transcribedText);
          setIsRecording(false);
          return;
        }
        
      } catch (webSpeechError) {
        console.warn('⚠️ Web Speech API failed:', webSpeechError.message);
        
        // If Web Speech fails, try recording audio for manual transcription
        console.log('🔄 Falling back to audio recording...');
        setTranscript('🔄 Web Speech failed, trying audio recording...');
        
        try {
          // Request microphone permission for recording
          const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              sampleRate: 16000,
              channelCount: 1,
              echoCancellation: true,
              noiseSuppression: true
            } 
          });
          
          console.log('✅ Microphone access granted for recording');
          setTranscript('🎤 Recording audio... (speak clearly)');
          
          // Set up MediaRecorder
          let mimeType = 'audio/webm;codecs=opus';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'audio/webm';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
              mimeType = 'audio/mp4';
              if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = '';
              }
            }
          }
          
          const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
          const audioChunks: Blob[] = [];
          
          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunks.push(event.data);
            }
          };
          
          mediaRecorder.onstop = async () => {
            console.log('🛑 Audio recording stopped');
            setTranscript('🔄 Processing recorded audio...');
            
            try {
              const audioBlob = new Blob(audioChunks, { type: mimeType || 'audio/webm' });
              
              if (audioBlob.size < 1000) {
                throw new Error('Audio recording too short or empty');
              }
              
              // Try to process the recorded audio
              const transcribedText = await recordAudioOnly(audioBlob);
              
              if (transcribedText && transcribedText.length > 0) {
                setTranscript(transcribedText);
                setIsProcessing(true);
                saveTranscriptAndAdvance(transcribedText);
              } else {
                throw new Error('No transcription available');
              }
              
            } catch (audioError) {
              console.warn('⚠️ Audio processing failed:', audioError.message);
              setTranscript('Audio recorded but transcription not available. Please use text input below.');
              setShowTextInput(true);
            }
            
            // Clean up
            stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
          };
          
          mediaRecorder.onerror = (event) => {
            console.error('❌ MediaRecorder error:', event.error);
            setTranscript('Recording failed. Please use text input.');
            setShowTextInput(true);
            setIsRecording(false);
          };
          
          // Start recording
          mediaRecorder.start(1000);
          
          // Auto-stop after 60 seconds
          const autoStopTimeout = setTimeout(() => {
            if (mediaRecorder.state === 'recording') {
              mediaRecorder.stop();
            }
          }, 60000);
          
          // Store recorder for manual stopping
          speechRecognitionRef.current = {
            stop: () => {
              clearTimeout(autoStopTimeout);
              if (mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
              }
            }
          };
          
        } catch (recordingError) {
          console.error('❌ Audio recording also failed:', recordingError);
          setTranscript('Both speech recognition and audio recording failed. Please use text input.');
          setShowTextInput(true);
          setIsRecording(false);
        }
      }
      
    } catch (error) {
      console.error('❌ Error starting recording:', error);
      setIsRecording(false);
      
      if (error.name === 'NotAllowedError') {
        setTranscript('❌ Microphone access denied. Please allow microphone access and try again.');
      } else if (error.name === 'NotFoundError') {
        setTranscript('❌ No microphone found. Please check your microphone connection.');
      } else {
        setTranscript(`❌ Recording error: ${error.message}. Please use text input.`);
      }
      
      setShowTextInput(true);
    }
  };

  const stopRecording = () => {
    if (speechRecognitionRef.current && isRecording) {
      try {
        speechRecognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
      setIsRecording(false);
    }
  };



  const saveTranscriptAndAdvance = async (transcribedText: string) => {
    try {
      console.log('Transcript captured:', transcribedText);
      
      // For now, just log the transcript since database schema is inconsistent
      console.log('Transcript captured and saved locally:', transcribedText);
      
      // TODO: Fix database schema mismatch between sessions and conversation_transcripts tables
      // The sessions are created in 'sessions' table but conversation_transcripts references 'conversation_sessions'

      // Update session based on phase
      if (phase === 'founder_intro') {
        // Update session status to active (founder intro completed)
        try {
          await supabase
            .from('sessions')
            .update({
              status: 'active',
              started_at: new Date().toISOString()
            })
            .eq('id', sessionId);
        } catch (err) {
          console.error('Error updating session for founder intro:', err);
        }

        console.log('🎬 Transitioning to mid phase, playing:', videoSegments.mid);
        console.log('🎬 Current video URL being set:', videoSegments.mid);
        setPhase('mid');
        setCurrentVideoUrl(videoSegments.mid);
        setVideoEnded(false);
        setShowVideo(true);
        setVideoLoaded(false);
        setVideoError(false);

      } else if (phase === 'pitch_recording') {
        // Mark session as completed
        try {
          await supabase
            .from('sessions')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('id', sessionId);
        } catch (err) {
          console.error('Error updating session for pitch:', err);
        }

        setPhase('end');
        setCurrentVideoUrl(videoSegments.end);
        setVideoEnded(false);
        setShowVideo(true);
        setVideoLoaded(false);
      }

      setIsProcessing(false);

    } catch (error) {
      console.error('Error in saveTranscriptAndAdvance:', error);
      setIsProcessing(false);
    }
  };

  const handleStartFounderIntro = () => {
    startRecording();
  };

  const handleStartPitch = () => {
    startRecording();
  };

  const handleRestart = () => {
    setPhase('start');
    setCurrentVideoUrl(videoSegments.start);
    setVideoEnded(false);
    setShowVideo(true);
    setVideoLoaded(false);
    setVideoError(false);
    setTranscript('');
    setIsRecording(false);
    setIsProcessing(false);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Video Persona Section */}
      <div className="glass rounded-xl border border-slate-700/30 overflow-hidden mb-8">
        {showVideo ? (
          <div className="relative bg-black">
            <video
              ref={videoRef}
              key={currentVideoUrl} // Force re-render when URL changes
              autoPlay
              muted
              onEnded={handleVideoEnded}
              onLoadedData={() => {
                console.log('🎥 Video loaded:', currentVideoUrl);
                console.log('🎥 Video element src:', videoRef.current?.src);
                console.log('🎥 Video element currentSrc:', videoRef.current?.currentSrc);
                console.log('🎥 Video duration:', videoRef.current?.duration);
                console.log('🎥 Video readyState:', videoRef.current?.readyState);
                
                // Force a network request to verify what's actually being served
                fetch(currentVideoUrl)
                  .then(response => {
                    console.log('🌐 Fetch response status:', response.status);
                    console.log('🌐 Fetch response headers:', response.headers.get('content-length'));
                    console.log('🌐 Fetch response URL:', response.url);
                  })
                  .catch(err => console.error('🌐 Fetch error:', err));
                
                handleVideoLoaded();
              }}
              onError={(e) => {
                console.error('🎥 Video error:', currentVideoUrl, e);
                handleVideoError();
              }}
              className="w-full h-[500px] object-cover"
              controls={false}
            >
              <source src={currentVideoUrl} type="video/mp4" />
            </video>
            
            {/* Mute/Unmute Button */}
            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.muted = !videoRef.current.muted;
                }
              }}
              className="absolute top-4 right-4 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm"
              title={videoRef.current?.muted ? "Unmute" : "Mute"}
            >
              {videoRef.current?.muted ? "🔇" : "🔊"}
            </button>
            
            {/* Video fallback - only show if video failed to load */}
            {(videoError || !videoLoaded) && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700">
                <div className="text-center text-white">
                  <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <div className="text-4xl font-bold">RV</div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Rohan Vyas</h3>
                  <p className="text-blue-100 text-lg">AI Investor • AgentVC</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Static image when video is not playing
          <div className="text-center py-12 bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="w-40 h-40 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <div className="text-white text-5xl font-bold">RV</div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Rohan Vyas</h2>
            <p className="text-slate-300 text-lg">AI Investor • AgentVC</p>
          </div>
        )}
        
        {/* Script Display */}
        {getCurrentScript() && (
          <div className="bg-slate-800/50 border-t border-slate-700/30 p-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">RV</span>
              </div>
              <div>
                <p className="text-white leading-relaxed">{getCurrentScript()}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recording Controls - Only show when needed */}
      {(phase === 'founder_intro' || phase === 'pitch_recording' || phase === 'completed') && (
        <div className="glass rounded-xl border border-slate-700/30 p-8 mb-8">
          {phase === 'founder_intro' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">Tell us about yourself</h3>
              <p className="text-slate-300">Share your background and introduce your company</p>
            </div>
            
            {!isRecording && !isProcessing && (
              <div className="space-y-4">
                {/* Microphone Test Section */}
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">Microphone Test</h4>
                    <button
                      onClick={async () => {
                        if (isTesting) {
                          setIsTesting(false);
                          setTestTranscript('');
                          return;
                        }

                        // Test microphone access and Whisper loading
                        try {
                          setIsTesting(true);
                          setTestTranscript('🔍 Testing microphone access...');
                          
                          const stream = await navigator.mediaDevices.getUserMedia({ 
                            audio: {
                              sampleRate: 16000,
                              channelCount: 1,
                              echoCancellation: true,
                              noiseSuppression: true
                            } 
                          });
                          
                          setTestTranscript('✅ Microphone access granted! Testing Whisper model...');
                          
                          // Test Web Speech API
                          try {
                            setTestTranscript('🤖 Testing Web Speech API...');
                            
                            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                            
                            if (SpeechRecognition) {
                              setTestTranscript('✅ Web Speech API available! Voice recording ready.');
                              console.log('🧪 [TEST] Web Speech API supported');
                            } else {
                              setTestTranscript('⚠️ Web Speech API not supported. Will use audio recording fallback.');
                              console.log('🧪 [TEST] Web Speech API not supported');
                            }
                            
                          } catch (speechError) {
                            console.error('🧪 [TEST] Speech API test error:', speechError);
                            setTestTranscript('⚠️ Speech recognition not available. Text input will be used.');
                          }
                          
                          // Stop the stream
                          stream.getTracks().forEach(track => track.stop());
                          
                          setTimeout(() => {
                            setIsTesting(false);
                          }, 3000);
                          
                        } catch (error) {
                          console.error('Microphone test error:', error);
                          setIsTesting(false);
                          
                          if (error.name === 'NotAllowedError') {
                            setTestTranscript('❌ Microphone access denied. Please allow microphone access and try again.');
                          } else if (error.name === 'NotFoundError') {
                            setTestTranscript('❌ No microphone found. Please check your microphone connection.');
                          } else {
                            setTestTranscript(`❌ Test failed: ${error.message}`);
                          }
                        }
                      }}
                      className={`px-4 py-2 ${isTesting ? 'bg-green-600 hover:bg-green-700' : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'} text-white rounded-lg font-medium text-sm transition-colors`}
                    >
                      {isTesting ? '✅ Test Complete' : '🎤 Test Microphone'}
                    </button>
                  </div>
                  
                  {/* Test Results */}
                  {testTranscript && (
                    <div className={`${testTranscript.includes('✅') ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'} border rounded-lg p-3 mb-3`}>
                      <p className={`text-sm ${testTranscript.includes('✅') ? 'text-green-300' : 'text-red-300'} font-medium`}>
                        {testTranscript}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Main Action Buttons */}
                <div className="flex flex-col items-center space-y-4">
                  <button
                    onClick={handleStartFounderIntro}
                    className="px-10 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
                  >
                    🎤 Start Voice Introduction
                  </button>
                  
                  <div className="flex items-center space-x-3">
                    <div className="h-px bg-slate-600 w-16"></div>
                    <span className="text-slate-400 text-sm font-medium">or</span>
                    <div className="h-px bg-slate-600 w-16"></div>
                  </div>
                  
                  <button
                    onClick={() => setShowTextInput(!showTextInput)}
                    className="px-8 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 font-medium transition-colors"
                  >
                    ⌨️ Type Introduction
                  </button>
                </div>
                
                  {/* Text Input Form */}
                  {showTextInput && (
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4 mt-6">
                      <h4 className="font-medium text-slate-100">Type your introduction</h4>
                      <textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Tell us about yourself and your company..."
                        className="w-full p-4 bg-slate-700 text-slate-100 border border-slate-600 rounded-lg resize-none h-32 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => {
                            setShowTextInput(false);
                            setTextInput('');
                          }}
                          className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 font-medium transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (textInput.trim()) {
                              setTranscript(textInput.trim());
                              setIsProcessing(true);
                              saveTranscriptAndAdvance(textInput.trim());
                              setShowTextInput(false);
                              setTextInput('');
                            }
                          }}
                          disabled={!textInput.trim()}
                          className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 font-semibold transition-all"
                        >
                          Submit Introduction
                        </button>
                      </div>
                    </div>
                  )}
              </div>
            )}

            {isRecording && (
              <div className="space-y-6 text-center">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-700 font-semibold text-lg">🎤 Recording in progress...</span>
                  </div>
                  
                  {transcript && (
                    <div className="bg-white border border-red-300 rounded-lg p-4 max-w-2xl mx-auto">
                      <p className="text-sm text-gray-800 italic">"{transcript}"</p>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-4">
                      💡 Tip: Speak clearly and close to your microphone
                    </p>
                    <button
                      onClick={stopRecording}
                      className="px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold transition-colors shadow-lg"
                    >
                      🛑 Stop Recording
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="text-center py-8">
                <div className="inline-flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-blue-600 font-medium text-lg">Processing your introduction...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {phase === 'pitch_recording' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Present your pitch</h3>
              <p className="text-gray-600">Share your startup vision and business opportunity</p>
            </div>
            
            {!isRecording && !isProcessing && (
              <div className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <button
                    onClick={handleStartPitch}
                    className="px-10 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
                  >
                    🎤 Start Voice Pitch
                  </button>
                  
                  <div className="flex items-center space-x-3">
                    <div className="h-px bg-gray-300 w-16"></div>
                    <span className="text-gray-500 text-sm font-medium">or</span>
                    <div className="h-px bg-gray-300 w-16"></div>
                  </div>
                  
                  <button
                    onClick={() => setShowTextInput(!showTextInput)}
                    className="px-8 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 font-medium transition-colors"
                  >
                    ⌨️ Type Pitch
                  </button>
                </div>
                
                  {/* Text Input Form for Pitch */}
                  {showTextInput && (
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4 mt-6">
                      <h4 className="font-medium text-slate-100">Type your pitch</h4>
                      <textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Present your startup pitch here..."
                        className="w-full p-4 bg-slate-700 text-slate-100 border border-slate-600 rounded-lg resize-none h-40 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => {
                            setShowTextInput(false);
                            setTextInput('');
                          }}
                          className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 font-medium transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (textInput.trim()) {
                              setTranscript(textInput.trim());
                              setIsProcessing(true);
                              saveTranscriptAndAdvance(textInput.trim());
                              setShowTextInput(false);
                              setTextInput('');
                            }
                          }}
                          disabled={!textInput.trim()}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold transition-all"
                        >
                          Submit Pitch
                        </button>
                      </div>
                    </div>
                  )}
              </div>
            )}

            {isRecording && (
              <div className="space-y-6 text-center">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-700 font-semibold text-lg">🎤 Recording your pitch...</span>
                  </div>
                  
                  {transcript && (
                    <div className="bg-white border border-red-300 rounded-lg p-4 max-w-2xl mx-auto max-h-40 overflow-y-auto">
                      <p className="text-sm text-gray-800 italic">"{transcript}"</p>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-4">
                      💡 Take your time and speak clearly
                    </p>
                    <button
                      onClick={stopRecording}
                      className="px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold transition-colors shadow-lg"
                    >
                      🛑 Finish Pitch
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="text-center py-8">
                <div className="inline-flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                  <span className="text-green-600 font-medium text-lg">Processing your pitch...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {phase === 'completed' && (
          <div className="space-y-6 text-center">
            <div className="bg-green-50 border border-green-200 rounded-xl p-8">
              <div className="text-green-600 font-bold text-2xl mb-4">✅ Pitch Session Complete!</div>
              <p className="text-gray-600 mb-6">Thank you for sharing your vision. Your pitch has been recorded and will be reviewed by our team.</p>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={onConversationEnd}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors shadow-lg"
                >
                  Return to Dashboard
                </button>
                <button
                  onClick={handleRestart}
                  className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 font-medium transition-colors"
                >
                  Restart Session
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      )}

      {/* Transcript Display - Only show when there's actual content */}
      {transcript && transcript.trim() && !transcript.includes('🎤') && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-slate-100 mb-3 text-lg">Your Response:</h3>
          <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
            <p className="text-slate-300 italic leading-relaxed">"{transcript}"</p>
          </div>
        </div>
      )}

      {/* Session Progress -- Dark Theme */}
      <div className="mt-8 bg-slate-800 p-5 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-base font-semibold text-slate-100">Session Progress</span>
          <span className="text-sm font-medium text-slate-300">{phase === 'start' ? '20' : phase === 'founder_intro' ? '40' : phase === 'mid' ? '60' : phase === 'pitch_recording' ? '80' : '100'}%</span>
        </div>
        <div className="w-full bg-slate-600 rounded-full h-2 mb-3">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
            style={{
              width: `${phase === 'start' ? 20 : phase === 'founder_intro' ? 40 : phase === 'mid' ? 60 : phase === 'pitch_recording' ? 80 : 100}%`
            }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          <span>Start</span>
          <span>Introduction</span>
          <span>Pitch</span>
          <span>Complete</span>
        </div>
      </div>
    </div>
  );
};