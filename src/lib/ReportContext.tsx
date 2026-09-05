"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Report } from "./types";
import { mockReports } from "./data/mockData";

interface ReportContextType {
  reports: Report[];
  addReport: (report: Report) => void;
  updateReportStatus: (id: string, status: Report["status"]) => void;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export function ReportProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = useState<Report[]>(() => {
    if (typeof window === "undefined") return mockReports;
    const saved = localStorage.getItem("jansetu_reports");
    if (!saved) return mockReports;
    try {
      return JSON.parse(saved) as Report[];
    } catch {
      return mockReports;
    }
  });

  useEffect(() => {
    // Listen for cross-tab changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "jansetu_reports" && e.newValue) {
        setReports(JSON.parse(e.newValue));
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const addReport = (report: Report) => {
    setReports((prev) => {
      const next = [report, ...prev];
      localStorage.setItem("jansetu_reports", JSON.stringify(next));
      return next;
    });
  };

  const updateReportStatus = (id: string, status: Report["status"]) => {
    setReports((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r));
      localStorage.setItem("jansetu_reports", JSON.stringify(next));
      return next;
    });
  };

  return (
    <ReportContext.Provider value={{ reports, addReport, updateReportStatus }}>
      {children}
    </ReportContext.Provider>
  );
}

export function useReports() {
  const context = useContext(ReportContext);
  if (context === undefined) {
    throw new Error("useReports must be used within a ReportProvider");
  }
  return context;
}
