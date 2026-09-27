"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock3, FileText, Loader2, Plus, ShieldAlert, Trash2, TriangleAlert } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useReports } from "@/lib/ReportContext";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading, deleteAccount } = useAuth();
  const { reports, deleteReport } = useReports();
  const [deletingReportId, setDeletingReportId] = useState<string | null>(null);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [accountPassword, setAccountPassword] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const stats = useMemo(() => ({
    total: reports.length,
    resolved: reports.filter((report) => report.status === "Resolved").length,
    urgent: reports.filter((report) => (report.aiAnalysis?.priorityScore || 0) > 80).length,
  }), [reports]);

  const handleDeleteReport = async (reportId: string) => {
    if (!window.confirm(`Permanently delete report ${reportId}?`)) return;
    setDeletingReportId(reportId);
    setDeleteError("");
    try {
      await deleteReport(reportId);
    } catch {
      setDeleteError("We couldn't delete this report from the database. Please try again.");
    } finally {
      setDeletingReportId(null);
    }
  };

  const handleDeleteAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!window.confirm("Permanently delete your account and all of its reports? This cannot be undone.")) return;
    setIsDeletingAccount(true);
    setDeleteError("");
    const result = await deleteAccount(accountPassword);
    setIsDeletingAccount(false);
    if (result.error) {
      setDeleteError(result.error);
      return;
    }
    router.replace("/");
  };

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

          {deleteError && (
            <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              {deleteError}
            </p>
          )}

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
                  <div className="flex shrink-0 items-center justify-between gap-5 sm:justify-end">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Clock3 className="h-4 w-4" />
                      {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleDeleteReport(report.id)}
                      disabled={deletingReportId === report.id || isDeletingAccount}
                      aria-label={`Delete report ${report.id}`}
                      title="Delete report permanently"
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-wait disabled:opacity-50 dark:text-slate-400 dark:hover:bg-red-950/50 dark:hover:text-red-300"
                    >
                      {deletingReportId === report.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Delete account and data</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
            This permanently deletes your Firebase account and all reports stored under it. You will need to confirm your current sign-in method.
          </p>
          {!showDeleteAccount ? (
            <button
              type="button"
              onClick={() => { setShowDeleteAccount(true); setDeleteError(""); }}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40"
            >
              <Trash2 className="h-4 w-4" /> Delete account and reports
            </button>
          ) : (
            <form onSubmit={handleDeleteAccount} className="mt-4 max-w-lg space-y-3">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Current password, for email/password accounts
                <input
                  type="password"
                  value={accountPassword}
                  onChange={(event) => setAccountPassword(event.target.value)}
                  autoComplete="current-password"
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal text-slate-900 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/15 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400">Google accounts will be asked to reauthenticate with Google instead.</p>
              <div className="flex flex-wrap gap-3">
                <button type="submit" disabled={isDeletingAccount} className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-800 disabled:cursor-wait disabled:opacity-60">
                  {isDeletingAccount && <Loader2 className="h-4 w-4 animate-spin" />}
                  Permanently delete account
                </button>
                <button type="button" disabled={isDeletingAccount} onClick={() => { setShowDeleteAccount(false); setAccountPassword(""); setDeleteError(""); }} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800">
                  Cancel
                </button>
              </div>
            </form>
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
