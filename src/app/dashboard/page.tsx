"use client";

import { useState } from 'react';
import { useReports } from '@/lib/ReportContext';
import { useLanguage } from '@/lib/LanguageContext';
import { AlertCircle, Clock, CheckCircle2, TrendingUp, Filter, Search, Building2, MapPin } from 'lucide-react';
import Map from '@/components/ui/Map';

export default function GovernmentDashboard() {
  const { reports, updateReportStatus } = useReports();
  const { t } = useLanguage();
  const [filter, setFilter] = useState('All');

  // Stats
  const total = reports.length;
  const critical = reports.filter(r => (r.aiAnalysis?.priorityScore || 0) > 80).length;

  const handleUpdateStatus = (id: string, currentStatus: string) => {
    let nextStatus = 'Under Review';
    if (currentStatus === 'Submitted') nextStatus = 'Department Assigned';
    else if (currentStatus === 'Department Assigned') nextStatus = 'Acknowledged';
    else if (currentStatus === 'Acknowledged') nextStatus = 'Under Review';
    else if (currentStatus === 'Under Review') nextStatus = 'Work Initiated';
    else if (currentStatus === 'Work Initiated') nextStatus = 'Resolved';
    else return;
    updateReportStatus(id, nextStatus as any);
  };

  return (
    <div className="bg-slate-50 flex-1 flex flex-col h-screen overflow-hidden">
      <div className="bg-white border-b border-gray-200 px-6 py-4 shrink-0 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('govDashTitle')}</h1>
          <p className="text-sm text-gray-500">{t('govDashSub')}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm text-gray-700">
            <Building2 className="w-4 h-4 text-gray-500" />
            <span>Hyderabad Municipality</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/3 flex flex-col bg-white border-r border-gray-200 overflow-hidden">
          <div className="grid grid-cols-2 gap-4 p-4 border-b border-gray-100 bg-slate-50">
            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col">
              <span className="text-gray-500 text-xs font-medium uppercase mb-1">{t('totalReports')}</span>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-gray-900">{total}</span>
                <TrendingUp className="w-4 h-4 text-emerald-500 mb-1" />
              </div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-red-100 shadow-sm flex flex-col">
              <span className="text-red-500 text-xs font-medium uppercase mb-1">{t('criticalPriority')}</span>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-red-600">{critical}</span>
                <AlertCircle className="w-4 h-4 text-red-500 mb-1" />
              </div>
            </div>
          </div>

          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search..." className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {reports.map(report => (
              <div key={report.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:border-blue-300 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <span className="text-xs font-mono text-gray-500">{report.id}</span>
                    <h3 className="font-semibold text-gray-900 mt-1">{report.aiAnalysis?.issueCategory}</h3>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-bold ${
                    (report.aiAnalysis?.priorityScore || 0) > 80 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {report.aiAnalysis?.priorityScore}/100
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 flex items-center gap-1 mb-3">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{report.location.address}</span>
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    {report.status === 'Resolved' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-blue-500" />
                    )}
                    <span className="text-xs font-medium text-gray-600">{report.status}</span>
                  </div>
                  {report.status !== 'Resolved' && (
                    <button 
                      onClick={() => handleUpdateStatus(report.id, report.status)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                    >
                      {t('updateStatus')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-2/3 p-4 relative flex flex-col">
          {reports.some(r => r.createdAt > new Date(Date.now() - 1000 * 60).toISOString() && (r.aiAnalysis?.priorityScore || 0) > 80) && (
            <div className="absolute top-8 right-8 z-10 bg-white p-4 rounded-xl shadow-xl flex gap-4 max-w-sm border-l-4 border-red-500">
              <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{t('newAlert')}</h4>
                <p className="text-xs text-gray-600 mt-1">A critical issue was just assigned to Municipal Roads Dept.</p>
              </div>
            </div>
          )}
          <Map reports={reports} />
        </div>
      </div>
    </div>
  );
}
