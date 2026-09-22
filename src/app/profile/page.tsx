"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, CheckCircle2, Clock3, FileText, Loader2, Plus, ShieldAlert, TriangleAlert } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useReports } from "@/lib/ReportContext";

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { reports } = useReports();
  const stats = useMemo(() => ({
    total: reports.length,
    resolved: reports.filter((report) => report.status === "Resolved").length,
    urgent: reports.filter((report) => (report.aiAnalysis?.priorityScore || 0) > 80).length,
  }), [reports]);

  if (authLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600 dark:text-cyan-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-6 text-center">
        <ShieldAlert className="h-12 w-12 text-cyan-600 dark:text-cyan-400" />
        <h1 className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">Sign in to view your profile</h1>
        <Link href="/login" className="mt-6 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-cyan-700">
          Sign in <ArrowRight className="ml-2 inline h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <main className="flex-1 bg-slate-50 dark:bg-slate-950 px-4 py-10 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="mx-auto max-w-6xl">
        <section className="relative overflow-hidden rounded-3xl bg-[#102a43] dark:bg-slate-900 px-7 py-9 text-white sm:px-10 border border-transparent dark:border-slate-800">
          <div className="absolute -right-12 -top-28 h-72 w-72 rounded-full border-[36px] border-cyan-300/10" />
          <div className="relative flex flex-col justify-between gap-7 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Citizen profile</p>
              <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">Hello, {user.name.split(" ")[0]}.</h1>
              <p className="mt-2 text-slate-300">Your civic contributions, all in one place.</p>
            </div>
            <Link href="/report" className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 px-5 py-3 text-sm font-bold text-[#102a43] shadow-md transition">
              <Plus className="h-4 w-4" /> Report an issue
            </Link>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Stat
            icon={<FileText className="h-5 w-5" />}
            label="Reports submitted"
            value={stats.total}
            color="text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60"
          />
          <Stat
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Issues resolved"
            value={stats.resolved}
            color="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60"
          />
          <Stat
            icon={<TriangleAlert className="h-5 w-5" />}
            label="High priority reports"
            value={stats.urgent}
            color="text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60"
          />
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm sm:p-8 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your reports</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Follow the progress of issues you have raised.</p>
            </div>
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-600 dark:text-slate-300">
              {stats.total} total
            </span>
          </div>

          {reports.length === 0 ? (
            <div className="py-16 text-center">
              <FileText className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
              <p className="mt-4 font-semibold text-slate-700 dark:text-slate-300">No reports yet</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your first report can help start a change.</p>
            </div>
          ) : (
            <div className="mt-6 divide-y divide-slate-100 dark:divide-slate-800">
              {reports.map((report) => (
                <div key={report.id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-400">{report.id}</span>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        report.status === "Resolved"
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                          : "bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300"
                      }`}>
                        {report.status}
                      </span>
                    </div>
                    <h3 className="mt-2 truncate font-semibold text-slate-900 dark:text-white">
                      {report.aiAnalysis?.issueCategory || "Civic issue"}
                    </h3>
                    <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{report.description}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Clock3 className="h-4 w-4" />
                    {new Date(report.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Stat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-colors">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
        {icon}
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}
