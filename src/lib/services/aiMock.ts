import { AIAnalysis, Report } from '../types';

export const simulateAIAnalysis = async (reportText: string, mediaType: string, existingReports: Report[] = []): Promise<AIAnalysis> => {
  // Simulate network delay for AI processing
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Basic keyword matching for demo logic
  const text = reportText.toLowerCase();
  
  let category = 'Other';
  let subCategory = 'General Issue';
  let severity: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';
  let department = 'dept-general';
  
  if (text.includes('pothole') || text.includes('road')) {
    category = 'Roads & Transport';
    subCategory = 'Large Pothole';
    severity = text.includes('large') || text.includes('huge') ? 'High' : 'Medium';
    department = 'dept-roads';
  } else if (text.includes('garbage') || text.includes('trash') || text.includes('waste')) {
    category = 'Waste Management';
    subCategory = 'Garbage Accumulation';
    severity = 'Medium';
    department = 'dept-sanitation';
  } else if (text.includes('water') || text.includes('drain') || text.includes('pipe')) {
    category = 'Water & Sanitation';
    subCategory = 'Water Leakage / Drainage';
    severity = 'High';
    department = 'dept-water';
  } else if (text.includes('light') || text.includes('electric')) {
    category = 'Electricity';
    subCategory = 'Broken Streetlight';
    severity = 'Low';
    department = 'dept-electricity';
  }
  
  const similarReportsCount = existingReports.filter(r => r.aiAnalysis?.issueCategory === category).length;
  const affectedPopulation = /\b(many|hundreds|neighborhood|community|crowd|several|multiple)\b/.test(text) ? 60 : 20;
  const priorityFactors = [
    { factor: 'Severity', score: { Low: 10, Medium: 20, High: 30, Critical: 40 }[severity], max: 40 },
    { factor: 'People affected', score: Math.min(25, Math.ceil(affectedPopulation / 10)), max: 25 },
    { factor: 'Immediate safety/urgency', score: /\b(danger|dangerous|urgent|immediate|accident|injur|fire|flood)\w*\b/.test(text) ? 20 : severity === 'High' ? 12 : 5, max: 20 },
    { factor: 'Repeated local reports', score: Math.min(15, similarReportsCount * 3), max: 15 },
  ];
  const priorityScore = priorityFactors.reduce((total, factor) => total + factor.score, 0);
  
  return {
    issueCategory: category,
    issueSubcategory: subCategory,
    severity,
    confidence: 0.85 + (Math.random() * 0.1),
    assignedDepartmentId: department,
    priorityScore,
    affectedPopulation,
    reasoning: similarReportsCount > 0 
      ? `The AI determined this is a ${severity.toLowerCase()} severity issue relating to ${category.toLowerCase()}. Found ${similarReportsCount} prior similar reports, increasing priority.` 
      : `The AI determined this is a ${severity.toLowerCase()} severity issue relating to ${category.toLowerCase()} based on the visual and text cues provided.`,
    priorityFactors,
  };
};
