import { AIAnalysis, Report } from '../types';

export const simulateAIAnalysis = async (reportText: string, mediaType: string, existingReports: Report[] = []): Promise<AIAnalysis> => {
  // Simulate network delay for AI processing
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Basic keyword matching for demo logic
  const text = reportText.toLowerCase();
  
  let category = 'Other';
  let subCategory = 'General Issue';
  let severity: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';
  let score = 50;
  let department = 'dept-general';
  
  if (text.includes('pothole') || text.includes('road')) {
    category = 'Roads & Transport';
    subCategory = 'Large Pothole';
    severity = text.includes('large') || text.includes('huge') ? 'High' : 'Medium';
    score = severity === 'High' ? 88 : 60;
    department = 'dept-roads';
  } else if (text.includes('garbage') || text.includes('trash') || text.includes('waste')) {
    category = 'Waste Management';
    subCategory = 'Garbage Accumulation';
    severity = 'Medium';
    score = 75;
    department = 'dept-sanitation';
  } else if (text.includes('water') || text.includes('drain') || text.includes('pipe')) {
    category = 'Water & Sanitation';
    subCategory = 'Water Leakage / Drainage';
    severity = 'High';
    score = 82;
    department = 'dept-water';
  } else if (text.includes('light') || text.includes('electric')) {
    category = 'Electricity';
    subCategory = 'Broken Streetlight';
    severity = 'Low';
    score = 40;
    department = 'dept-electricity';
  }
  
  const similarReportsCount = existingReports.filter(r => r.aiAnalysis?.issueCategory === category).length;
  // Dynamically increase score for each similar report on file to simulate clustering urgency
  const finalScore = Math.min(100, score + similarReportsCount);
  
  return {
    issueCategory: category,
    issueSubcategory: subCategory,
    severity,
    confidence: 0.85 + (Math.random() * 0.1),
    assignedDepartmentId: department,
    priorityScore: finalScore,
    affectedPopulation: Math.floor(Math.random() * 200) + 20,
    reasoning: similarReportsCount > 0 
      ? `The AI determined this is a ${severity.toLowerCase()} severity issue relating to ${category.toLowerCase()}. Found ${similarReportsCount} prior similar reports, increasing priority.` 
      : `The AI determined this is a ${severity.toLowerCase()} severity issue relating to ${category.toLowerCase()} based on the visual and text cues provided.`,
    priorityFactors: [
      { factor: 'Severity', score: severity === 'High' ? 25 : 15, max: 30 },
      { factor: 'Affected population', score: 15, max: 20 },
      { factor: 'Repeated reports (Dynamic)', score: Math.min(15, (finalScore > 70 ? 10 : 2) + similarReportsCount), max: 15 },
      { factor: 'Urgency', score: finalScore > 80 ? 4 : 2, max: 5 },
    ]
  };
};
