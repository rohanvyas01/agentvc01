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

  // Video segments for each phase (Tavus generated videos)
  const videoSegments = {
    start: '/videos/rohan_intro.mp4',      // Start video
    mid: '/videos/rohan_transition.mp4',   // Mid video  
    end: '/videos/rohan_wrap_up.mp4'       // End video
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

  const startRecording = async () => {
    try {
      // Check if browser supports speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        alert('Speech recognition not supported in Brave. Please enable it in brave://settings/privacy or use Chrome.');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      
      // Brave-specific settings
      if (navigator.userAgent.includes('Brave')) {
        recognition.continuous = false; // Brave works better with non-continuous
      }
      
      let finalTranscript = '';
      let hasDetectedSpeech = false;

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsRecording(true);
        setTranscript(''); // Clear previous transcript
      };

      recognition.onspeechstart = () => {
        console.log('Speech detected');
        hasDetectedSpeech = true;
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          console.log('Transcript result:', transcript, 'Final:', event.results[i].isFinal);
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Update transcript in real-time
        const fullTranscript = finalTranscript + interimTranscript;
        setTranscript(fullTranscript);
        console.log('Current transcript:', fullTranscript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        
        if (event.error === 'network') {
          // Network error is common and usually not a problem
          console.log('Network error - speech recognition will work offline');
          // Don't show alert, just continue - the transcript might still be captured
          return;
        } else if (event.error === 'not-allowed') {
          alert('❌ Microphone access denied. Please click the microphone icon in your browser address bar and allow access.');
          setIsProcessing(false);
        } else if (event.error === 'no-speech') {
          // Don't show alert for no-speech, just let it end naturally
          console.log('No speech detected');
          setIsProcessing(false);
        } else {
          alert('Speech recognition error: ' + event.error + '. Please try the "Type Introduction" option instead.');
          setIsProcessing(false);
        }
      };

      recognition.onend = () => {
        console.log('Speech recognition ended. Final transcript:', finalTranscript);
        setIsRecording(false);
        
        // If we have any transcript (even partial), use it
        const currentTranscript = transcript || finalTranscript;
        
        if (currentTranscript && currentTranscript.trim().length > 0) {
          setIsProcessing(true);
          saveTranscriptAndAdvance(currentTranscript.trim());
        } else if (hasDetectedSpeech) {
          // Speech was detected but no transcript - offer alternatives
          const retry = confirm('Speech was detected but not transcribed clearly. Would you like to try again, or use text input instead?');
          if (retry) {
            // Try recording again
            setTimeout(() => startRecording(), 500);
          } else {
            // Show text input
            setShowTextInput(true);
          }
          setIsProcessing(false);
        } else {
          // No speech detected - offer alternatives
          const useText = confirm('No speech detected. Would you like to use text input instead?');
          if (useText) {
            setShowTextInput(true);
          }
          setIsProcessing(false);
        }
      };

      // Store recognition instance for stopping
      speechRecognitionRef.current = recognition;
      
      // Request microphone permission first
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        recognition.start();
      } catch (micError) {
        alert('Could not access microphone. Please allow microphone access and try again.');
        console.error('Microphone access error:', micError);
      }
      
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      alert('Could not start speech recognition. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (speechRecognitionRef.current && isRecording) {
      // Stop speech recognition
      speechRecognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  // No longer needed - speech recognition handles transcription directly

  const saveTranscriptAndAdvance = async (transcribedText: string) => {
    try {
      // Save transcript to database - try different column names
      console.log('Saving transcript:', { sessionId, transcribedText });
      
      const { error: transcriptError } = await supabase
        .from('conversation_transcripts')
        .insert({
          session_id: sessionId,
          speaker: 'founder',
          message: transcribedText,
          timestamp: new Date().toISOString()
        });

      if (transcriptError) throw transcriptError;

      // Update session based on phase
      if (phase === 'founder_intro') {
        // After founder introduction, show mid video
        await supabase
          .from('sessions')
          .update({
            status: 'active'
          })
          .eq('id', sessionId);

        setPhase('mid');
        setCurrentVideoUrl(videoSegments.mid);
        setVideoEnded(false);
        setShowVideo(true);
        setVideoLoaded(false);

      } else if (phase === 'pitch_recording') {
        // After pitch recording, show end video
        await supabase
          .from('sessions')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', sessionId);

        setPhase('end');
        setCurrentVideoUrl(videoSegments.end);
        setVideoEnded(false);
        setShowVideo(true);
        setVideoLoaded(false);

        // Trigger analysis
        await supabase.functions.invoke('analyze-conversation', {
          body: { session_id: sessionId }
        });
      }

    } catch (error) {
      console.error('Error saving transcript:', error);
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
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Video Persona Section */}
      <div className="mb-8">
        {showVideo ? (
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={currentVideoUrl}
              autoPlay
              muted
              onEnded={handleVideoEnded}
              onLoadedData={handleVideoLoaded}
              onError={handleVideoError}
              className="w-full h-96 object-cover"
              controls={false}
            />
            
            {/* Mute/Unmute Button */}
            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.muted = !videoRef.current.muted;
                }
              }}
              className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all"
            >
              🔇
            </button>
            
            {/* Video fallback - only show if video failed to load */}
            {(videoError || !videoLoaded) && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700">
                <div className="text-center text-white">
                  <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="text-3xl font-bold">RV</div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Rohan Vyas</h3>
                  <p className="text-blue-100">AI Investor • AgentVC</p>
                </div>
              </div>
            )}
            

          </div>
        ) : (
          // Static image when video is not playing
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="text-white text-4xl font-bold">RV</div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Rohan Vyas</h2>
            <p className="text-gray-600">AI Investor • AgentVC</p>
          </div>
        )}
      </div>

      {/* Recording Controls */}
      <div className="text-center mb-6">
        {phase === 'founder_intro' && (
          <div className="space-y-4">
            {!isRecording && !isProcessing && (
              <div className="space-y-3">
                {/* Microphone Test Button */}
                <button
                  onClick={async () => {
                    if (isTesting) {
                      // Stop test
                      if (speechRecognitionRef.current) {
                        speechRecognitionRef.current.stop();
                      }
                      setIsTesting(false);
                      return;
                    }

                    // Start test
                    try {
                      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                      
                      if (!SpeechRecognition) {
                        alert('Speech recognition not supported in Brave. Please enable it in brave://settings/privacy or use Chrome.');
                        return;
                      }

                      // Request microphone permission first
                      try {
                        await navigator.mediaDevices.getUserMedia({ audio: true });
                      } catch (micError) {
                        alert('❌ Microphone access denied. Please allow microphone access and try again.');
                        return;
                      }

                      const recognition = new SpeechRecognition();
                      recognition.continuous = true;
                      recognition.interimResults = true;
                      recognition.lang = 'en-US';
                      recognition.maxAlternatives = 1;

                      // Brave-specific settings
                      if (navigator.userAgent.includes('Brave')) {
                        recognition.continuous = false;
                      }

                      setIsTesting(true);
                      setTestTranscript('');

                      recognition.onstart = () => {
                        console.log('Microphone test started');
                      };

                      recognition.onresult = (event) => {
                        let transcript = '';
                        for (let i = event.resultIndex; i < event.results.length; i++) {
                          transcript += event.results[i][0].transcript;
                        }
                        setTestTranscript(transcript);
                        console.log('Test transcript:', transcript);
                      };

                      recognition.onerror = (event) => {
                        console.error('Test error:', event.error);
                        setIsTesting(false);
                        if (event.error === 'not-allowed') {
                          alert('❌ Microphone access denied. Please allow microphone access in Brave.');
                        } else if (event.error === 'network') {
                          // Network error is common and usually not a problem
                          console.log('Network error during test - this is normal');
                        } else {
                          alert(`❌ Microphone test error: ${event.error}`);
                        }
                      };

                      recognition.onend = () => {
                        console.log('Microphone test ended');
                        setIsTesting(false);
                        
                        // Auto-restart for continuous testing in Brave
                        if (navigator.userAgent.includes('Brave') && isTesting) {
                          setTimeout(() => {
                            if (isTesting) {
                              recognition.start();
                            }
                          }, 100);
                        }
                      };

                      speechRecognitionRef.current = recognition;
                      recognition.start();
                      
                    } catch (error) {
                      alert('❌ Could not start microphone test. Please check your browser settings.');
                      setIsTesting(false);
                    }
                  }}
                  className={`px-6 py-2 ${isTesting ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'} text-white rounded-lg font-medium text-sm`}
                >
                  {isTesting ? '🛑 Stop Test' : '🎤 Test Microphone'}
                </button>
                
                {/* Test Results */}
                {isTesting && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800 mb-2">🎤 Speak now to test your microphone...</p>
                    {testTranscript && (
                      <div className="bg-white border border-yellow-300 rounded p-2">
                        <p className="text-sm text-gray-800 italic">"{testTranscript}"</p>
                      </div>
                    )}
                  </div>
                )}
                
                {testTranscript && !isTesting && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">✅ Microphone test successful! Last heard:</p>
                    <p className="text-sm text-gray-700 italic">"{testTranscript}"</p>
                  </div>
                )}
                
                <button
                  onClick={handleStartFounderIntro}
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-lg"
                >
                  🎤 Start Voice Introduction
                </button>
                <div className="text-center">
                  <span className="text-gray-400 text-sm">or</span>
                </div>
                <button
                  onClick={() => setShowTextInput(!showTextInput)}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                >
                  ⌨️ Type Introduction
                </button>
                
                {/* Text Input Form */}
                {showTextInput && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Type your introduction here..."
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="flex space-x-2">
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
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
                      >
                        Submit
                      </button>
                      <button
                        onClick={() => {
                          setShowTextInput(false);
                          setTextInput('');
                        }}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isRecording && (
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-600 font-medium">🎤 Listening... (speak now)</span>
                </div>
                {transcript && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-md mx-auto">
                    <p className="text-sm text-blue-800 italic">"{transcript}"</p>
                  </div>
                )}
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    💡 Tip: Speak clearly and close to your microphone
                  </p>
                </div>
                <button
                  onClick={stopRecording}
                  className="px-8 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  Stop Recording
                </button>
              </div>
            )}

            {isProcessing && (
              <div className="text-blue-600 font-medium">Processing your introduction...</div>
            )}
          </div>
        )}

        {phase === 'pitch_recording' && (
          <div className="space-y-4">
            {!isRecording && !isProcessing && (
              <div className="space-y-3">
                <button
                  onClick={handleStartPitch}
                  className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-lg"
                >
                  🎤 Start Voice Pitch
                </button>
                <div className="text-center">
                  <span className="text-gray-400 text-sm">or</span>
                </div>
                <button
                  onClick={() => setShowTextInput(!showTextInput)}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                >
                  ⌨️ Type Pitch
                </button>
                
                {/* Text Input Form for Pitch */}
                {showTextInput && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Type your pitch here..."
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none h-32 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <div className="flex space-x-2">
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
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium"
                      >
                        Submit Pitch
                      </button>
                      <button
                        onClick={() => {
                          setShowTextInput(false);
                          setTextInput('');
                        }}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isRecording && (
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-600 font-medium">🎤 Recording your pitch... (speak now)</span>
                </div>
                {transcript && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 max-w-md mx-auto max-h-32 overflow-y-auto">
                    <p className="text-sm text-green-800 italic">"{transcript}"</p>
                  </div>
                )}
                <button
                  onClick={stopRecording}
                  className="px-8 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  Finish Pitch
                </button>
              </div>
            )}

            {isProcessing && (
              <div className="text-blue-600 font-medium">Processing your pitch...</div>
            )}
          </div>
        )}

        {phase === 'completed' && (
          <div className="space-y-4">
            <div className="text-green-600 font-medium text-lg">✅ Pitch Session Complete!</div>
            <div className="space-x-4">
              <button
                onClick={onConversationEnd}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Return to Dashboard
              </button>
              <button
                onClick={handleRestart}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
              >
                Restart Session
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transcript Display */}
      {transcript && (
        <div className="bg-gray-50 rounded-lg p-4 mt-6">
          <h3 className="font-medium text-gray-900 mb-2">Your Response:</h3>
          <p className="text-gray-700 italic">"{transcript}"</p>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="mt-8">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <span>Progress</span>
          <span>{phase === 'start' ? '20' : phase === 'founder_intro' ? '40' : phase === 'mid' ? '60' : phase === 'pitch_recording' ? '80' : '100'}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${phase === 'start' ? 20 : phase === 'founder_intro' ? 40 : phase === 'mid' ? 60 : phase === 'pitch_recording' ? 80 : 100}%` 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};