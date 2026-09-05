"use client";

import { useReports } from '@/lib/ReportContext';
import { useLanguage } from '@/lib/LanguageContext';
import { mockClusters } from '@/lib/data/mockData';
import { BrainCircuit, TrendingUp, AlertTriangle, Lightbulb, BarChart3 } from 'lucide-react';

export default function PolicymakerDashboard() {
  const { reports } = useReports();
  const { t } = useLanguage();
  
  const total = reports.length + mockClusters.reduce((acc, c) => acc + c.reportsCount - 1, 0);
  const affected = 14500 + reports.reduce((acc, r) => acc + (r.aiAnalysis?.affectedPopulation || 0), 0);
  
  return (
    <div className="bg-slate-50 flex-1 flex flex-col overflow-y-auto">
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/10 mix-blend-overlay"></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-400" />
            {t('policyTitle')}
          </h1>
          <p className="text-slate-400 mt-2 text-lg max-w-3xl">{t('policySub')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{t('totalAnalysed')}</p>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-3xl font-black text-gray-900">{total}</span>
              <span className="text-emerald-500 text-sm font-medium flex items-center mb-1"><TrendingUp className="w-3 h-3 mr-1"/> +12%</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{t('citizensReached')}</p>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-3xl font-black text-gray-900">{affected.toLocaleString()}</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{t('infraGapIndex')}</p>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-3xl font-black text-amber-600">68/100</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-20"><BrainCircuit className="w-16 h-16"/></div>
             <p className="text-sm font-semibold text-blue-100 uppercase tracking-wide relative z-10">AI Confidence Core</p>
             <div className="mt-2 flex items-end gap-2 relative z-10">
               <span className="text-3xl font-black text-white">High</span>
             </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 pt-4 flex items-center gap-2"><Lightbulb className="w-5 h-5 text-amber-500" /> {t('aiStrategic')}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
            <div className="flex gap-4">
              <div className="mt-1"><AlertTriangle className="w-6 h-6 text-amber-600" /></div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Priority Intervention: Road Infrastructure</h3>
                <p className="text-gray-700 mt-2 text-sm leading-relaxed">
                  &quot;Zone 4 has a high concentration of road-related citizen reports combined with high population density.&quot;
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-lg text-gray-900 mb-4">{t('topDemand')}</h3>
            <div className="space-y-4">
              {mockClusters.map(cluster => (
                <div key={cluster.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">{cluster.reportsCount}</div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{cluster.primaryCategory}</p>
                      <p className="text-xs text-gray-500">{cluster.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 text-sm">{cluster.priorityScore}/100</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
