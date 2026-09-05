"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { Report } from '@/lib/types';

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });

export default function Map({ reports }: { reports: Report[] }) {
  const [L, setL] = useState<typeof import('leaflet') | null>(null);

  useEffect(() => {
    import('leaflet').then((leaflet) => {
      setL(leaflet);
    });
  }, []);

  if (!L) return <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center">Loading map...</div>;

  const createIcon = (score: number) => {
    let color = 'bg-blue-500';
    if (score > 80) color = 'bg-red-500';
    else if (score > 60) color = 'bg-amber-500';
    
    return L.divIcon({
      className: 'bg-transparent',
      html: `<div class="w-6 h-6 ${color} rounded-full border-2 border-white shadow-md flex items-center justify-center"><div class="w-2 h-2 bg-white rounded-full"></div></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  return (
    <div className="h-full w-full relative z-0 border rounded-xl overflow-hidden shadow-sm">
      <MapContainer center={[17.4399, 78.4983]} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {reports.map((report) => (
          <Marker 
            key={report.id} 
            position={[report.location.lat, report.location.lng]}
            icon={createIcon(report.aiAnalysis?.priorityScore || 50)}
          >
             <Popup>
               <div className="p-1 min-w-[200px]">
                 <div className="flex justify-between items-start mb-2">
                   <h3 className="font-bold text-sm">{report.aiAnalysis?.issueCategory}</h3>
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
