export type IssueStatus = 'Submitted' | 'AI Analyzed' | 'Department Assigned' | 'Acknowledged' | 'Under Review' | 'Work Initiated' | 'Resolved';

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface PriorityFactor {
  factor: string;
  score: number;
  max: number;
}

export interface AIAnalysis {
  issueCategory: string;
  issueSubcategory: string;
  severity: SeverityLevel;
  confidence: number;
  assignedDepartmentId: string;
  priorityScore: number;
  priorityFactors: PriorityFactor[];
  reasoning: string;
  affectedPopulation: number;
}

export interface Report {
  id: string;
  citizenId?: string;
  description: string;
  mediaUrl?: string; // Optional for text-only
  mediaType: 'video' | 'audio' | 'image' | 'text';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: IssueStatus;
  aiAnalysis?: AIAnalysis;
  createdAt: string; // ISO string
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  jurisdiction: string;
}

export interface Cluster {
  id: string;
  primaryCategory: string;
  reportsCount: number;
  estimatedAffected: number;
  firstReported: string;
  status: 'Open' | 'Resolved';
  priorityScore: number;
  location: { lat: number; lng: number };
}
