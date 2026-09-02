import { Department, Report, Cluster } from '../types';

export const mockDepartments: Department[] = [
  { id: 'dept-roads', name: 'Municipal Roads Department', jurisdiction: 'Hyderabad City' },
  { id: 'dept-sanitation', name: 'Waste Management Department', jurisdiction: 'Hyderabad City' },
  { id: 'dept-water', name: 'Water & Sewerage Board', jurisdiction: 'Hyderabad City' },
  { id: 'dept-electricity', name: 'Electricity Board', jurisdiction: 'Hyderabad City' },
];

export const mockReports: Report[] = [
  {
    id: 'JS-2026-001248',
    description: 'There is a large pothole near the school and several vehicles are having difficulty passing.',
    mediaType: 'video',
    mediaUrl: '/mocks/video1.mp4',
    location: {
      lat: 17.4399,
      lng: 78.4983,
      address: 'Near ABC Public School, Secunderabad',
    },
    status: 'Department Assigned',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    aiAnalysis: {
      issueCategory: 'Roads & Transport',
      issueSubcategory: 'Large Pothole',
      severity: 'High',
      confidence: 0.94,
      assignedDepartmentId: 'dept-roads',
      priorityScore: 87,
      affectedPopulation: 156,
      reasoning: 'High-severity road damage has been repeatedly reported near a school and lies in a high-traffic area.',
      priorityFactors: [
        { factor: 'Severity', score: 27, max: 30 },
        { factor: 'Affected population', score: 17, max: 20 },
        { factor: 'Near school', score: 14, max: 15 },
        { factor: 'Repeated reports', score: 13, max: 15 },
        { factor: 'Population density', score: 8, max: 10 },
        { factor: 'Infrastructure gap', score: 4, max: 5 },
        { factor: 'Urgency', score: 4, max: 5 },
      ]
    }
  },
  {
    id: 'JS-2026-001249',
    description: 'Waterlogging on main road after recent rains.',
    mediaType: 'image',
    mediaUrl: '/mocks/image1.jpg',
    location: {
      lat: 17.4421,
      lng: 78.5011,
      address: 'Main Road, Secunderabad',
    },
    status: 'AI Analyzed',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    aiAnalysis: {
      issueCategory: 'Water & Sanitation',
      issueSubcategory: 'Waterlogging',
      severity: 'Medium',
      confidence: 0.88,
      assignedDepartmentId: 'dept-water',
      priorityScore: 65,
      affectedPopulation: 300,
      reasoning: 'Water accumulation on main road causing traffic delays.',
      priorityFactors: [
        { factor: 'Severity', score: 15, max: 30 },
        { factor: 'Affected population', score: 18, max: 20 },
        { factor: 'Traffic impact', score: 12, max: 15 }
      ]
    }
  },
  {
    id: 'JS-2026-001250',
    description: 'Streetlight is broken on 4th avenue.',
    mediaType: 'text',
    location: {
      lat: 17.4475,
      lng: 78.4900,
      address: '4th Avenue, Hyderabad',
    },
    status: 'Resolved',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    aiAnalysis: {
      issueCategory: 'Electricity',
      issueSubcategory: 'Broken Streetlight',
      severity: 'Low',
      confidence: 0.96,
      assignedDepartmentId: 'dept-electricity',
      priorityScore: 42,
      affectedPopulation: 50,
      reasoning: 'Standard maintenance required. Low safety risk.',
      priorityFactors: [
        { factor: 'Severity', score: 5, max: 30 },
        { factor: 'Safety risk', score: 8, max: 15 }
      ]
    }
  }
];

export const mockClusters: Cluster[] = [
  {
    id: 'RD-1042',
    primaryCategory: 'Road Damage',
    reportsCount: 27,
    estimatedAffected: 156,
    firstReported: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    status: 'Open',
    priorityScore: 94,
    location: { lat: 17.4399, lng: 78.4983 }
  }
];
