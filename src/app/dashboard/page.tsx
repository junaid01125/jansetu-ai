"use client";

import { useState } from 'react';
import { useReports } from '@/lib/ReportContext';
import { useLanguage } from '@/lib/LanguageContext';
import { AlertCircle, Clock, CheckCircle2, TrendingUp, Search, Building2, MapPin } from 'lucide-react';
import { IssueStatus } from '@/lib/types';
import Map from '@/components/ui/Map';

export default function GovernmentDashboard() {
  const { reports, updateReportStatus } = useReports();
  const { t } = useLanguage();
  const [currentTime] = useState(() => Date.now());
  const [searchQuery, setSearchQuery] = useState('');
  const activeReports = reports.filter(report => report.status !== 'Resolved');

  // Stats
  const total = activeReports.length;
  const critical = activeReports.filter(r => (r.aiAnalysis?.priorityScore || 0) > 80).length;

  const handleUpdateStatus = (id: string, currentStatus: string) => {
    let nextStatus = 'Under Review';
    if (currentStatus === 'Submitted') nextStatus = 'Department Assigned';
    else if (currentStatus === 'Department Assigned') nextStatus = 'Acknowledged';
    else if (currentStatus === 'Acknowledged') nextStatus = 'Under Review';
    else if (currentStatus === 'Under Review') nextStatus = 'Work Initiated';
    else if (currentStatus === 'Work Initiated') nextStatus = 'Resolved';
    else return;
    updateReportStatus(id, nextStatus as IssueStatus);
  };

  const filteredReports = activeReports.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.id.toLowerCase().includes(q) ||
      r.aiAnalysis?.issueCategory.toLowerCase().includes(q) ||
      r.location.address.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-slate-50 dark:bg-slate-950 flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden transition-colors duration-200">
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4 shrink-0 flex justify-between items-center transition-colors">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('govDashTitle')}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">{t('govDashSub')}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 dark:bg-slate-800 px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-slate-200 border border-gray-200/60 dark:border-slate-700/60">
            <Building2 className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            <span>{activeReports[0]?.location.address || 'No active reporting area'}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Side List */}
        <div className="w-1/3 min-w-[340px] max-w-[460px] flex flex-col bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 overflow-hidden transition-colors">
          <div className="grid grid-cols-2 gap-3 p-4 border-b border-gray-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60">
            <div className="bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col">
              <span className="text-gray-500 dark:text-slate-400 text-xs font-semibold uppercase mb-1">{t('totalReports')}</span>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-black text-gray-900 dark:text-white">{total}</span>
                <TrendingUp className="w-4 h-4 text-emerald-500 mb-1" />
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-red-100 dark:border-red-900/40 shadow-sm flex flex-col">
              <span className="text-red-500 dark:text-red-400 text-xs font-semibold uppercase mb-1">{t('criticalPriority')}</span>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-black text-red-600 dark:text-red-400">{critical}</span>
                <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 mb-1" />
              </div>
            </div>
          </div>

          <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search issues by ID, type, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-500/20"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredReports.map(report => (
              <div
                key={report.id}
                className="bg-white dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700/80 rounded-xl p-4 shadow-sm hover:border-blue-300 dark:hover:border-cyan-400 transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <span className="text-xs font-mono text-gray-500 dark:text-slate-400">{report.id}</span>
                    <h3 className="font-semibold text-gray-900 dark:text-slate-100 mt-1">{report.aiAnalysis?.issueCategory}</h3>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-bold ${
                    (report.aiAnalysis?.priorityScore || 0) > 80
                      ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200/50 dark:border-red-900/50'
                      : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-900/50'
                  }`}>
                    {report.aiAnalysis?.priorityScore}/100
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-slate-300 flex items-center gap-1.5 mb-3">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-gray-400 dark:text-slate-500" />
                  <span className="truncate">{report.location.address}</span>
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-700/70">
                  <div className="flex items-center gap-2">
                    {report.status === 'Resolved' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-blue-500 dark:text-cyan-400" />
                    )}
                    <span className="text-xs font-medium text-gray-600 dark:text-slate-300">{report.status}</span>
                  </div>
                  {report.status !== 'Resolved' && (
                    <button 
                      onClick={() => handleUpdateStatus(report.id, report.status)}
                      className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:text-blue-800 dark:hover:text-cyan-300 hover:underline"
                    >
                      {t('updateStatus')}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {filteredReports.length === 0 && (
              <div className="text-center py-8 text-sm text-gray-500 dark:text-slate-400">
                No reports match your query.
              </div>
            )}
          </div>
        </div>

        {/* Right Side Map */}
        <div className="flex-1 p-4 relative flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
          {activeReports.some(r => r.createdAt > new Date(currentTime - 1000 * 60).toISOString() && (r.aiAnalysis?.priorityScore || 0) > 80) && (
            <div className="absolute top-8 right-8 z-10 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-xl flex gap-4 max-w-sm border-l-4 border-red-500 border border-gray-200/80 dark:border-slate-800">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">{t('newAlert')}</h4>
                <p className="text-xs text-gray-600 dark:text-slate-300 mt-1">A critical issue was just assigned to Municipal Roads Dept.</p>
              </div>
            </div>
          )}
          <Map reports={activeReports} />
        </div>
      </div>
    </div>
  );
}
