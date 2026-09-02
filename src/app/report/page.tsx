"use client";

import { useState } from 'react';
import { Camera, Video, Upload, MapPin, Building2, CheckCircle2, ShieldCheck, AlertTriangle, ArrowRight, Loader2, BrainCircuit } from 'lucide-react';
import { simulateAIAnalysis } from '@/lib/services/aiMock';
import { AIAnalysis, Report } from '@/lib/types';
import { useReports } from '@/lib/ReportContext';
import { useLanguage } from '@/lib/LanguageContext';
import Link from 'next/link';

export default function ReportIssuePage() {
  const { t } = useLanguage();
  const [step, setStep] = useState<'idle' | 'recording' | 'recorded' | 'analyzing' | 'result' | 'success'>('idle');
  const [reportText, setReportText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysis | null>(null);
  const [uploadMode, setUploadMode] = useState<'video' | 'text'>('text');
  
  const { addReport, reports } = useReports();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      setTimeout(() => {
        setStep('recorded');
        setIsUploading(false);
        if (!reportText) {
          setReportText("Automatically transcribed from uploaded media:\nThere is a large pothole near the school and several vehicles are having difficulty passing.");
        }
      }, 1500);
    }
  };

  const handleStartRecording = () => {
    setStep('recording');
    setTimeout(() => {
      setStep('recorded');
      if (!reportText) setReportText("Automatically transcribed: A large water leak is happening on the main street.");
    }, 3000);
  };

  const handleSubmit = async () => {
    if (!reportText.trim() && step !== 'recorded') return;
    setStep('analyzing');
    const result = await simulateAIAnalysis(reportText || "General issue reported", uploadMode, reports);
    setAnalysisResult(result);
    setStep('result');
  };

  const handleConfirm = () => {
    if (!analysisResult) return;
    
    const lat = 17.40 + (Math.random() * 0.1);
    const lng = 78.40 + (Math.random() * 0.1);
    
    const newReport: Report = {
      id: `JS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
      description: reportText,
      mediaType: uploadMode === 'video' ? 'video' : 'text',
      mediaUrl: uploadMode === 'video' ? '/mocks/demo-video-placeholder.png' : undefined,
      location: {
        lat: lat,
        lng: lng,
        address: 'Detected Location in Hyderabad Jurisdiction',
      },
      status: 'Submitted',
      aiAnalysis: analysisResult,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    addReport(newReport);
    setStep('success');
  };

  return (
    <div className="bg-slate-50 flex-1 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">{t('reportTitle')}</h1>
          <p className="mt-2 text-gray-600">{t('reportSub')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          
          {(step === 'idle' || step === 'recording' || step === 'recorded') && (
            <div className="p-8">
              <div className="flex justify-between mb-6 border-b border-gray-100 pb-4">
                <div className="flex gap-4">
                  <button onClick={() => setUploadMode('text')} className={`flex items-center gap-2 pb-2 font-medium px-2 ${uploadMode === 'text' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>
                    {t('textOnly')}
                  </button>
                  <button onClick={() => setUploadMode('video')} className={`flex items-center gap-2 pb-2 font-medium px-2 ${uploadMode === 'video' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>
                    <Video className="w-4 h-4"/> {t('videoPhoto')}
                  </button>
                </div>
              </div>
              
              {uploadMode === 'video' && (
                <div className={`w-full h-64 rounded-xl bg-gray-50 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center relative overflow-hidden transition-all mb-6 ${step === 'recording' ? "border-red-500 bg-red-50" : ""}`}>
                  
                  {isUploading && (
                    <div className="flex flex-col items-center gap-4 text-blue-600">
                       <Loader2 className="w-8 h-8 animate-spin" />
                       <span className="font-medium">Uploading media...</span>
                    </div>
                  )}

                  {step === 'idle' && !isUploading && (
                    <div className="flex flex-col items-center gap-6 w-full">
                      <button onClick={handleStartRecording} className="flex flex-col items-center gap-2 group">
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center group-hover:scale-105 transition-transform group-hover:bg-blue-200 cursor-pointer text-blue-600 shadow-sm">
                          <Video className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{t('recordInstantly')}</span>
                      </button>
                      
                      <div className="text-gray-400 text-sm">OR</div>
                      
                      <label className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-50 shadow-sm text-sm font-medium text-gray-700 transition">
                        <Upload className="w-4 h-4 text-gray-500" />
                        {t('uploadFile')}
                        <input type="file" className="hidden" onChange={handleFileUpload} accept="video/*,image/*" />
                      </label>
                    </div>
                  )}
                  
                  {step === 'recording' && (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center animate-pulse">
                        <div className="w-6 h-6 rounded-full bg-red-500"></div>
                      </div>
                      <span className="text-lg font-medium text-red-600">Recording... Speak now.</span>
                    </div>
                  )}

                  {step === 'recorded' && (
                    <div className="absolute inset-0 bg-emerald-50 flex items-center justify-center">
                       <div className="flex flex-col gap-2 items-center text-center">
                         <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                           <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                         </div>
                         <h3 className="font-semibold text-emerald-800 text-lg">Media Attached</h3>
                       </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('issueDescLabel')}</label>
                <textarea 
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder={t('issueDescPlaceholder')}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-gray-800"
                />
              </div>

              <div className="mt-8 flex justify-end">
                <button 
                  onClick={handleSubmit} 
                  disabled={!reportText.trim()}
                  className={`px-6 py-3 rounded-xl font-medium shadow-sm flex items-center gap-2 transition-all ${reportText.trim() ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                  {t('submitAi')} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 'analyzing' && (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-6" />
              <h2 className="text-2xl font-bold text-gray-900">AI Analyzing Your Report...</h2>
              <div className="mt-8 space-y-4 text-left max-w-sm w-full">
                <div className="flex items-center gap-3 text-gray-600"><CheckCircle2 className="w-5 h-5 text-blue-500"/> Transcribing audio & text...</div>
                <div className="flex items-center gap-3 text-gray-600"><CheckCircle2 className="w-5 h-5 text-blue-500"/> Extracting infrastructure class...</div>
                <div className="flex items-center gap-3 text-gray-400 animate-pulse"><Loader2 className="w-5 h-5 animate-spin"/> Routing to optimal jurisdiction...</div>
                <div className="flex items-center gap-3 text-gray-400"><div className="w-5" /> Calculating priority score...</div>
              </div>
            </div>
          )}

          {(step === 'result' && analysisResult) && (
            <div className="p-8 animate-in fade-in zoom-in duration-300">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-blue-100 text-blue-700 rounded-full shadow-sm">
                  <BrainCircuit className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">AI Analysis Complete</h2>
                  <p className="text-gray-600">Please review the extracted intelligence before routing it to the government.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-100/50 p-6 rounded-2xl border border-gray-100">
                <div className="space-y-5">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 block">Extracted Issue</span>
                    <p className="text-lg font-medium text-gray-900 bg-white p-2 rounded-lg border border-gray-200">{analysisResult.issueCategory} &gt; {analysisResult.issueSubcategory}</p>
                  </div>
                  <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">Assigned Department</span>
                      <p className="text-sm font-medium text-gray-900 flex items-center gap-1 mt-1"><Building2 className="w-4 h-4 text-emerald-500"/> {analysisResult.assignedDepartmentId.replace('dept-', '').toUpperCase()}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">Severity</span>
                      <p className={`text-sm font-bold ${analysisResult.severity === 'High' || analysisResult.severity === 'Critical' ? 'text-red-600' : 'text-amber-600'} mt-1`}>{analysisResult.severity.toUpperCase()}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10"></div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold uppercase tracking-wider text-gray-500">AI Priority Score</span>
                    {analysisResult.priorityScore > 75 && <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-1 rounded inline-flex animate-bounce">URGENT</span>}
                  </div>
                  <div className="text-5xl font-black text-gray-900 mb-3">{analysisResult.priorityScore}<span className="text-xl text-gray-400 font-medium tracking-normal">/100</span></div>
                  <p className="text-sm text-gray-600 font-medium">"{analysisResult.reasoning}"</p>
                </div>
              </div>

              <div className="mt-8 flex gap-4 justify-end">
                <button onClick={() => setStep('idle')} className="px-6 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                  {t('cancelEdit')}
                </button>
                <button onClick={handleConfirm} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-sm hover:bg-blue-50 flex items-center gap-2 transition-colors">
                  <ShieldCheck className="w-5 h-5" /> {t('submitGov')}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="p-16 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Priority Alert Submitted</h2>
              
              <div className="flex gap-4 w-full max-w-sm flex-col sm:flex-row mt-6">
                <button onClick={() => {
                  setStep('idle');
                  setReportText('');
                  setAnalysisResult(null);
                }} className="flex-1 py-3 rounded-xl font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
                  Submit Another
                </button>
                <Link href="/dashboard" className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-medium shadow-sm hover:bg-gray-800 flex items-center justify-center gap-2 transition-colors">
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
