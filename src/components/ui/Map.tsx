"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { useMap } from 'react-leaflet';
import { Report } from '@/lib/types';
import { useTheme } from '@/lib/ThemeContext';

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });

function MapViewport({ reports }: { reports: Report[] }) {
  const map = useMap();
  const latestReport = reports[0];

  useEffect(() => {
    if (latestReport) {
      map.setView([latestReport.location.lat, latestReport.location.lng], 13, { animate: true });
    }
  }, [latestReport, map]);

  return null;
}

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;

export default function Map({ reports }: { reports: Report[] }) {
  const [L, setL] = useState<typeof import('leaflet') | null>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    import('leaflet').then((leaflet) => {
      setL(leaflet);
    });
  }, []);

  if (!L) {
    return (
      <div className="h-full w-full bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center justify-center text-sm font-medium text-slate-500 dark:text-slate-400">
        Loading MapTiler interactive map...
      </div>
    );
  }

  const createIcon = (score: number) => {
    let color = 'bg-blue-500';
    if (score > 80) color = 'bg-red-500';
    else if (score > 60) color = 'bg-amber-500';
    
    return L.divIcon({
      className: 'bg-transparent',
      html: `<div class="w-6 h-6 ${color} rounded-full border-2 border-white dark:border-slate-900 shadow-md flex items-center justify-center"><div class="w-2 h-2 bg-white rounded-full"></div></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  const tileUrl = isDark
    ? `https://api.maptiler.com/maps/streets-v2-dark/256/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`
    : `https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`;

  return (
    <div className="h-full w-full relative z-0 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <MapContainer center={reports[0] ? [reports[0].location.lat, reports[0].location.lng] : [17.4399, 78.4983]} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }}>
        <MapViewport reports={reports} />
        <TileLayer
          key={isDark ? 'maptiler-dark' : 'maptiler-light'}
          attribution='&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>'
          url={tileUrl}
          maxZoom={20}
        />
        {reports.map((report) => (
          <Marker 
            key={report.id} 
            position={[report.location.lat, report.location.lng]}
            icon={createIcon(report.aiAnalysis?.priorityScore || 50)}
          >
             <Popup>
               <div className="p-1 min-w-[200px] text-slate-900">
                 <div className="flex justify-between items-start mb-2">
                   <h3 className="font-bold text-sm text-slate-900">{report.aiAnalysis?.issueCategory}</h3>
                   <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">{report.aiAnalysis?.priorityScore}/100</span>
                 </div>
                 <p className="text-xs text-gray-600 mb-2">{report.location.address}</p>
                 <div className="text-xs bg-gray-50 p-2 rounded border border-gray-100">
                   <strong>Status:</strong> {report.status}
                 </div>
               </div>
             </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
