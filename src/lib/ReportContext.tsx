"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { collection, doc, onSnapshot, orderBy, query, setDoc } from "firebase/firestore";
import { Report } from "./types";
import { useAuth } from "./AuthContext";
import { firestore } from "./firebase";

interface ReportContextType {
  reports: Report[];
  addReport: (report: Report) => Promise<void>;
  updateReportStatus: (id: string, status: Report["status"]) => Promise<void>;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export function ReportProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [userReports, setUserReports] = useState<Report[]>([]);

  const reports = user ? userReports : [];

  useEffect(() => {
    if (isLoading) return;
    if (!user) return;

    const reportsQuery = query(collection(firestore, "users", user.id, "reports"), orderBy("createdAt", "desc"));
    return onSnapshot(reportsQuery, (snapshot) => {
      setUserReports(snapshot.docs.map((report) => report.data() as Report));
    }, () => setUserReports([]));
  }, [isLoading, user]);

  const addReport = async (report: Report) => {
    if (!user) throw new Error("Please sign in before submitting a report");
    const firestoreReport = report.mediaUrl ? report : Object.fromEntries(
      Object.entries(report).filter(([key]) => key !== "mediaUrl")
    ) as Report;
    await setDoc(doc(firestore, "users", user.id, "reports", report.id), firestoreReport);
  };

  const updateReportStatus = async (id: string, status: Report["status"]) => {
    if (!user) return;
    const report = userReports.find((candidate) => candidate.id === id);
    if (!report) return;
    await setDoc(doc(firestore, "users", user.id, "reports", id), { ...report, status, updatedAt: new Date().toISOString() });
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
