"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Camera,
  Mic,
  Video,
  Upload,
  Building2,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Loader2,
  BrainCircuit,
  Square,
  Image as ImageIcon,
  Languages,
  RotateCcw,
  X,
  CircleDot
} from 'lucide-react';
import { AIAnalysis, Report } from '@/lib/types';
import { useReports } from '@/lib/ReportContext';
import { useLanguage } from '@/lib/LanguageContext';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { detectCurrentLocation, DetectedLocation } from '@/lib/location';

type CaptureMode = 'text' | 'audio' | 'photo' | 'video';
type SpeechMode = 'auto' | 'en' | 'hi' | 'te';
type SpeechRecognitionConstructor = new () => SpeechRecognition;

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export default function ReportIssuePage() {
  const { t, lang } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<'idle' | 'recording' | 'recorded' | 'analyzing' | 'result' | 'success'>('idle');
  const [reportText, setReportText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AIAnalysis | null>(null);
  const [captureMode, setCaptureMode] = useState<CaptureMode>('text');
  const [mediaPreview, setMediaPreview] = useState('');
  const [mediaError, setMediaError] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('Not detected yet');
  const [isListening, setIsListening] = useState(false);
  const [speechMode, setSpeechMode] = useState<SpeechMode>('auto');
  const [detectedLocation, setDetectedLocation] = useState<DetectedLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'detecting' | 'ready' | 'denied'>('idle');

  // Live camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const speechRecognitionsRef = useRef<SpeechRecognition[]>([]);
  const speechSessionRef = useRef(0);
  
  const { addReport, reports } = useReports();

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [authLoading, user, router]);

  const languageLabels = { en: 'English', hi: 'Hindi', te: 'Telugu' };
  const speechLanguages = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN' } as const;
  const speechLanguage = speechMode === 'auto' ? 'en-IN, hi-IN, te-IN' : speechLanguages[speechMode];

  // Clean up media streams on unmount
  useEffect(() => {
    return () => {
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      speechRecognitionsRef.current.forEach((recognition) => recognition.stop());
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    };
  }, [mediaPreview]);

  // Callback ref to connect stream to video element as soon as it mounts
  const setVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoElementRef.current = node;
    if (node && mediaStreamRef.current) {
      node.srcObject = mediaStreamRef.current;
      node.play().catch(() => {});
    }
  }, []);

  const identifyLanguage = (text: string) => {
    if (/^[\s\u0900-\u097F\p{P}\p{N}]+$/u.test(text)) return 'Hindi';
    if (/^[\s\u0C00-\u0C7F\p{P}\p{N}]+$/u.test(text)) return 'Telugu';
    if (/^[\s\x00-\x7F\p{P}\p{N}]+$/u.test(text)) return 'English';
    return `Selected language: ${languageLabels[lang]}`;
  };

  const requestLocationPermission = async () => {
    setLocationStatus('detecting');
    const location = await detectCurrentLocation();
    if (!location) {
      setLocationStatus('denied');
      return null;
    }
    setDetectedLocation(location);
    setLocationStatus('ready');
    return location;
  };

  // Start live camera stream
  const startLiveCamera = async (targetFacing = facingMode) => {
    try {
      setMediaError('');
      // Stop any existing tracks
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: { facingMode: targetFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: captureMode === 'video',
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;

      if (videoElementRef.current) {
        videoElementRef.current.srcObject = stream;
        videoElementRef.current.play().catch(() => {});
      }

      setIsCameraActive(true);
      setStep('idle');
    } catch {
      setMediaError('Camera permission was denied or camera is unavailable. Please grant camera permission in your browser.');
      setIsCameraActive(false);
    }
  };

  // Stop live camera stream
  const stopLiveCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (videoElementRef.current) {
      videoElementRef.current.srcObject = null;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsCameraActive(false);
  };

  // Toggle between front and rear cameras
  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startLiveCamera(nextMode);
  };

  // Capture still photo from the live video stream
  const capturePhoto = () => {
    const video = videoElementRef.current;
    if (!video || video.videoWidth === 0) {
      setMediaError('Camera feed is not ready yet. Please wait a moment.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) {
        setMediaError('Failed to capture photo frame.');
        return;
      }
      if (mediaPreview) URL.revokeObjectURL(mediaPreview);
      const url = URL.createObjectURL(blob);
      setMediaPreview(url);
      setStep('recorded');
      stopLiveCamera();
    }, 'image/jpeg', 0.92);
  };

  // Start recording video from live stream
  const startVideoRecording = () => {
    if (!mediaStreamRef.current) return;
    try {
      setMediaError('');
      mediaChunksRef.current = [];
      const recorder = new MediaRecorder(mediaStreamRef.current);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) mediaChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(mediaChunksRef.current, { type: 'video/webm' });
        if (mediaPreview) URL.revokeObjectURL(mediaPreview);
        const url = URL.createObjectURL(blob);
        setMediaPreview(url);
        setStep('recorded');
        stopLiveCamera();
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setStep('recording');
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch {
      setMediaError('Failed to start video recording. Please try again.');
    }
  };

  // Stop video recording
  const stopVideoRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  // Retake photo or record new video
  const retakeMedia = () => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaPreview('');
    setStep('idle');
    startLiveCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setMediaError('');
      stopLiveCamera();
      if (mediaPreview) URL.revokeObjectURL(mediaPreview);
      setMediaPreview(URL.createObjectURL(file));
      setCaptureMode(file.type.startsWith('image/') ? 'photo' : 'video');
      setStep('recorded');
    }
  };

  const stopAudioRecognition = () => {
    speechSessionRef.current += 1;
    speechRecognitionsRef.current.forEach((recognition) => recognition.stop());
    speechRecognitionsRef.current = [];
    speechRecognitionRef.current = null;
    setIsListening(false);
  };

  const handleAudioRecording = async () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setMediaError('Live transcription is not supported in this browser. Please type the report or use Chrome or Edge.');
      return;
    }
    if (isListening) {
      stopAudioRecognition();
      return;
    }
    try {
      const permissionStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      permissionStream.getTracks().forEach((track) => track.stop());
    } catch {
      setMediaError('Microphone permission was denied. Allow microphone access in your browser and try again.');
      return;
    }
    const session = speechSessionRef.current + 1;
    speechSessionRef.current = session;
    const languages = speechMode === 'auto' ? ['en', 'hi', 'te'] as const : [speechMode];
    const transcripts = new Map<string, string>();
    const completedLanguages = new Set<string>();
    let activeRecognizers = languages.length;
    let receivedTranscript = false;

    const completeRecognizer = (language: string) => {
      if (completedLanguages.has(language)) return;
      completedLanguages.add(language);
      activeRecognizers -= 1;
      if (activeRecognizers <= 0 && speechSessionRef.current === session) setIsListening(false);
    };

    const scoreTranscript = (transcript: string, language: string) => {
      const hasHindiScript = /[\u0900-\u097F]/u.test(transcript);
      const hasTeluguScript = /[\u0C00-\u0C7F]/u.test(transcript);
      const hasLatinScript = /[A-Za-z]/u.test(transcript);
      const scriptMatch = language === 'hi' ? hasHindiScript : language === 'te' ? hasTeluguScript : hasLatinScript && !hasHindiScript && !hasTeluguScript;
      return (scriptMatch ? 10000 : 0) + transcript.trim().length;
    };

    const updateTranscript = () => {
      const best = [...transcripts.entries()].sort((left, right) => scoreTranscript(right[1], right[0]) - scoreTranscript(left[1], left[0]))[0];
      if (!best) return;
      receivedTranscript = true;
      setReportText(best[1]);
      setDetectedLanguage(identifyLanguage(best[1]));
    };

    const recognitions = languages.map((language) => {
      const recognition = new Recognition();
      recognition.lang = speechLanguages[language];
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        let transcript = '';
        for (let index = 0; index < event.results.length; index += 1) transcript += event.results[index][0].transcript;
        transcripts.set(language, transcript);
        updateTranscript();
      };
      recognition.onerror = () => {
        completeRecognizer(language);
        if (activeRecognizers === 0 && !receivedTranscript && speechSessionRef.current === session) {
          setMediaError('Microphone transcription was unavailable. Choose a language or try Chrome or Edge again.');
          setIsListening(false);
        }
      };
      recognition.onend = () => {
        completeRecognizer(language);
      };
      return recognition;
    });

    speechRecognitionsRef.current = recognitions;
    speechRecognitionRef.current = recognitions[0];
    setMediaError('');
    setIsListening(true);
    recognitions.forEach((recognition) => {
      try {
        recognition.start();
      } catch {
        activeRecognizers -= 1;
      }
    });
  };

  const handleSubmit = async () => {
    if (!reportText.trim() && step !== 'recorded') return;
    setStep('analyzing');
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportText: reportText || "General issue reported", mediaType: captureMode, existingReports: reports }),
      });
      if (!response.ok) throw new Error('Analysis failed');
      const data = await response.json() as { analysis: AIAnalysis };
      setAnalysisResult(data.analysis);
      setStep('result');
    } catch {
      setMediaError('Unable to analyze the report right now. Please try again.');
      setStep('idle');
    }
  };

  const handleConfirm = async () => {
    if (!analysisResult) return;
    const location = detectedLocation || await requestLocationPermission();
    if (!location) {
      setMediaError('Location permission is required to submit this report. Please allow location access and try again.');
      return;
    }
    
    const newReport: Report = {
      id: `JS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
      description: reportText,
      mediaType: captureMode === 'video' ? 'video' : captureMode === 'photo' ? 'image' : captureMode === 'audio' ? 'audio' : 'text',
      mediaUrl: mediaPreview || undefined,
      location,
      status: 'Submitted',
      aiAnalysis: analysisResult,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    try {
      await addReport(newReport);
      setStep('success');
    } catch {
      setMediaError('We could not save this report. Please check your connection and try again.');
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 flex-1 py-12 transition-colors duration-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('reportTitle')}</h1>
          <p className="mt-2 text-gray-600 dark:text-slate-400">{t('reportSub')}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors">
          
          {(step === 'idle' || step === 'recording' || step === 'recorded') && (
            <div className="p-8">
              <div className="mb-6 grid grid-cols-2 gap-2 border-b border-gray-100 dark:border-slate-800 pb-5 sm:grid-cols-4">
                {([
                  ['text', 'Text', <Languages key="text-icon" className="h-4 w-4" />],
                  ['audio', 'Audio', <Mic key="audio-icon" className="h-4 w-4" />],
                  ['photo', 'Photo', <ImageIcon key="photo-icon" className="h-4 w-4" />],
                  ['video', 'Video', <Video key="video-icon" className="h-4 w-4" />],
                ] as const).map(([mode, label, icon]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      if (mode !== captureMode) {
                        stopLiveCamera();
                        if (captureMode === 'audio') stopAudioRecognition();
                      }
                      setCaptureMode(mode);
                      setMediaError('');
                      if (mode !== 'text') void requestLocationPermission();
                    }}
                    className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                      captureMode === mode
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>

              {captureMode !== 'text' && (
                <div className={`mb-5 rounded-xl border px-4 py-3 text-sm font-semibold ${locationStatus === 'ready'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300'
                  : locationStatus === 'denied'
                    ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300'
                    : 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300'
                }`}>
                  {locationStatus === 'ready' && `Location ready: ${detectedLocation?.address}`}
                  {locationStatus === 'detecting' && 'Requesting location permission...'}
                  {locationStatus === 'denied' && 'Location permission is required before submitting this report.'}
                  {locationStatus === 'idle' && 'Location permission is required for accurate map placement.'}
                </div>
              )}

              {captureMode === 'audio' && (
                <div className="mb-6 rounded-2xl border border-blue-100 dark:border-blue-900/50 bg-blue-50/70 dark:bg-blue-950/30 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Speak your report</p>
                      <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">Microphone permission is required for live transcription.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAudioRecording}
                      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition shadow-sm ${
                        isListening ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'
                      }`}
                    >
                      {isListening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      {isListening ? 'Stop listening' : 'Start speaking'}
                    </button>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-blue-800 dark:text-cyan-300">Audio language</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {([['auto', 'Auto detect'], ['en', 'English'], ['hi', 'Hindi'], ['te', 'Telugu']] as const).map(([mode, label]) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => {
                            if (isListening) stopAudioRecognition();
                            setSpeechMode(mode);
                            setDetectedLanguage('Not detected yet');
                          }}
                          className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${speechMode === mode
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-blue-200 bg-white text-blue-800 hover:border-blue-400 dark:border-blue-900 dark:bg-slate-900 dark:text-cyan-300'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-blue-800 dark:text-cyan-300">
                    <Languages className="h-4 w-4" /> {speechMode === 'auto' ? 'Auto detection: English, Hindi, or Telugu' : `Listening in ${languageLabels[speechMode]}`} ({speechLanguage}) {detectedLanguage !== 'Not detected yet' && `· Detected: ${detectedLanguage}`}
                  </div>
                </div>
              )}

              {/* LIVE CAMERA & CAPTURE VIEW */}
              {(captureMode === 'photo' || captureMode === 'video') && (
                <div className="mb-6">
                  {/* CASE 1: Captured media preview (still photo or recorded video) */}
                  {mediaPreview ? (
                    <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 p-4 text-center">
                      <div className="relative mx-auto max-h-80 overflow-hidden rounded-xl bg-black">
                        {captureMode === 'photo' ? (
                          <Image
                            src={mediaPreview}
                            alt="Captured civic issue"
                            width={640}
                            height={480}
                            unoptimized
                            className="mx-auto max-h-80 w-auto rounded-xl object-contain shadow-sm"
                          />
                        ) : (
                          <video src={mediaPreview} controls className="mx-auto max-h-80 rounded-xl shadow-sm" />
                        )}
                        <div className="absolute top-3 left-3 bg-emerald-600/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {captureMode === 'photo' ? 'Photo Captured' : 'Video Recorded'}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap justify-center items-center gap-3">
                        <button
                          type="button"
                          onClick={retakeMedia}
                          className="inline-flex items-center gap-2 rounded-xl bg-gray-900 dark:bg-slate-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 dark:hover:bg-slate-600 transition"
                        >
                          <RotateCcw className="h-4 w-4" /> Retake {captureMode === 'photo' ? 'Photo' : 'Video'}
                        </button>
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                          <Upload className="h-4 w-4 text-gray-500 dark:text-slate-400" /> Choose different file
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleFileUpload}
                            accept={captureMode === 'photo' ? 'image/*' : 'video/*'}
                          />
                        </label>
                      </div>
                    </div>
                  ) : isCameraActive ? (
                    /* CASE 2: LIVE CAMERA VIEWFINDER - Live moving video */
                    <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-blue-500/50 shadow-lg">
                      <video
                        ref={setVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-80 sm:h-96 object-cover bg-black"
                      />

                      {/* Top Overlay: Camera Status & Controls */}
                      <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
                        <div className="flex items-center gap-2">
                          {step === 'recording' ? (
                            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse shadow-md">
                              <CircleDot className="w-3.5 h-3.5" /> REC {formatSeconds(recordingDuration)}
                            </span>
                          ) : (
                            <span className="bg-emerald-600/90 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                              LIVE CAMERA
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 pointer-events-auto">
                          <button
                            type="button"
                            onClick={toggleCameraFacing}
                            title="Flip camera"
                            className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition-transform active:rotate-180"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={stopLiveCamera}
                            title="Close camera"
                            className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Viewfinder crosshairs / focus frame */}
                      <div className="absolute inset-10 border border-white/20 rounded-xl pointer-events-none flex items-center justify-center">
                        <div className="w-8 h-8 border border-white/40 rounded-full" />
                      </div>

                      {/* Bottom Shutter / Action Controls */}
                      <div className="absolute bottom-4 inset-x-0 flex justify-center items-center gap-4">
                        {captureMode === 'photo' ? (
                          <button
                            type="button"
                            onClick={capturePhoto}
                            className="group flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-white text-gray-900 font-bold text-sm shadow-2xl hover:bg-blue-50 transition-all hover:scale-105 active:scale-95"
                          >
                            <div className="w-4 h-4 rounded-full border-2 border-blue-600 group-hover:bg-blue-600 transition" />
                            <span>Capture Photo</span>
                          </button>
                        ) : step === 'recording' ? (
                          <button
                            type="button"
                            onClick={stopVideoRecording}
                            className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-red-600 text-white font-bold text-sm shadow-2xl hover:bg-red-500 transition-all animate-pulse"
                          >
                            <Square className="w-4 h-4 fill-white" />
                            <span>Stop Recording ({formatSeconds(recordingDuration)})</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={startVideoRecording}
                            className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-red-600 text-white font-bold text-sm shadow-2xl hover:bg-red-500 transition-all hover:scale-105 active:scale-95"
                          >
                            <div className="w-4 h-4 rounded-full bg-white" />
                            <span>Start Recording</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* CASE 3: Camera not opened yet - Prompt to open live camera */
                    <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-800/40 p-8 text-center transition-colors">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-cyan-400 mb-4 shadow-sm">
                        {captureMode === 'photo' ? <Camera className="h-8 w-8" /> : <Video className="h-8 w-8" />}
                      </div>
                      <h3 className="font-bold text-base text-gray-900 dark:text-white">
                        {captureMode === 'photo' ? 'Take a live photo' : 'Record a live video'}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-slate-400 max-w-sm mx-auto">
                        Your camera will stream live so you can align and capture the civic issue clearly.
                      </p>

                      <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => startLiveCamera()}
                          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-500 transition-all hover:scale-105"
                        >
                          {captureMode === 'photo' ? <Camera className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                          Open Live Camera
                        </button>
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-3 text-sm font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm">
                          <Upload className="h-4 w-4 text-gray-500 dark:text-slate-400" /> Upload from device
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleFileUpload}
                            accept={captureMode === 'photo' ? 'image/*' : 'video/*'}
                            capture={captureMode === 'photo' ? 'environment' : undefined}
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {mediaError && (
                <p role="alert" className="mb-5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300">
                  {mediaError}
                </p>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('issueDescLabel')}</label>
                <textarea 
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder={t('issueDescPlaceholder')}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500/30 transition-all text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div className="mt-8 flex justify-end">
                <button 
                  onClick={handleSubmit} 
                  disabled={!reportText.trim() && !mediaPreview}
                  className={`px-6 py-3 rounded-xl font-medium shadow-sm flex items-center gap-2 transition-all ${
                    reportText.trim() || mediaPreview
                      ? 'bg-blue-600 text-white hover:bg-blue-500'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600 cursor-not-allowed'
                  }`}
                >
                  {t('submitAi')} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 'analyzing' && (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-16 h-16 text-blue-600 dark:text-cyan-400 animate-spin mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Analyzing Your Report...</h2>
              <div className="mt-8 space-y-4 text-left max-w-sm w-full">
                <div className="flex items-center gap-3 text-gray-600 dark:text-slate-300"><CheckCircle2 className="w-5 h-5 text-blue-500 dark:text-cyan-400"/> Transcribing audio & text...</div>
                <div className="flex items-center gap-3 text-gray-600 dark:text-slate-300"><CheckCircle2 className="w-5 h-5 text-blue-500 dark:text-cyan-400"/> Extracting infrastructure class...</div>
                <div className="flex items-center gap-3 text-gray-400 dark:text-slate-500 animate-pulse"><Loader2 className="w-5 h-5 animate-spin"/> Routing to optimal jurisdiction...</div>
                <div className="flex items-center gap-3 text-gray-400 dark:text-slate-500"><div className="w-5" /> Calculating priority score...</div>
              </div>
            </div>
          )}

          {(step === 'result' && analysisResult) && (
            <div className="p-8 animate-in fade-in zoom-in duration-300">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-cyan-400 rounded-full shadow-sm">
                  <BrainCircuit className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Analysis Complete</h2>
                  <p className="text-gray-600 dark:text-slate-400">Please review the extracted intelligence before routing it to the government.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-100/50 dark:bg-slate-800/40 p-6 rounded-2xl border border-gray-100 dark:border-slate-800">
                <div className="space-y-5">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1 block">Extracted Issue</span>
                    <p className="text-lg font-medium text-gray-900 dark:text-white bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700">{analysisResult.issueCategory} &gt; {analysisResult.issueSubcategory}</p>
                  </div>
                  <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-200 dark:border-slate-700">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 block">Assigned Department</span>
                      <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1 mt-1"><Building2 className="w-4 h-4 text-emerald-500"/> {analysisResult.assignedDepartmentId.replace('dept-', '').toUpperCase()}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 block">Severity</span>
                      <p className={`text-sm font-bold ${analysisResult.severity === 'High' || analysisResult.severity === 'Critical' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'} mt-1`}>{analysisResult.severity.toUpperCase()}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/20 rounded-bl-full -z-10"></div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">AI Priority Score</span>
                    {analysisResult.priorityScore > 75 && <span className="text-[10px] bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-bold px-2 py-1 rounded inline-flex animate-bounce">URGENT</span>}
                  </div>
                  <div className="text-5xl font-black text-gray-900 dark:text-white mb-3">{analysisResult.priorityScore}<span className="text-xl text-gray-400 dark:text-slate-500 font-medium tracking-normal">/100</span></div>
                  <p className="text-sm text-gray-600 dark:text-slate-300 font-medium">&quot;{analysisResult.reasoning}&quot;</p>
                </div>
              </div>

              <div className="mt-8 flex gap-4 justify-end">
                <button onClick={() => setStep('idle')} className="px-6 py-3 rounded-xl font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                  {t('cancelEdit')}
                </button>
                <button onClick={handleConfirm} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-sm hover:bg-blue-500 flex items-center gap-2 transition-colors">
                  <ShieldCheck className="w-5 h-5" /> {t('submitGov')}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="p-16 flex flex-col items-center justify-center text-center animate-in fade-in slide-from-bottom-4 duration-500">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Priority Alert Submitted</h2>
              
              <div className="flex gap-4 w-full max-w-sm flex-col sm:flex-row mt-6">
                <button onClick={() => {
                  setStep('idle');
                  setReportText('');
                  setMediaPreview('');
                  setAnalysisResult(null);
                }} className="flex-1 py-3 rounded-xl font-medium text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors">
                  Submit Another
                </button>
                <Link href="/dashboard" className="flex-1 bg-gray-900 dark:bg-blue-600 text-white py-3 rounded-xl font-medium shadow-sm hover:bg-gray-800 dark:hover:bg-blue-500 flex items-center justify-center gap-2 transition-colors">
                  Dashboard
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
