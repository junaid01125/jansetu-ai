export interface DetectedLocation {
  lat: number;
  lng: number;
  address: string;
}

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000,
    });
  });
}

export async function detectCurrentLocation(): Promise<DetectedLocation | null> {
  try {
    const position = await getPosition();
    const { latitude: lat, longitude: lng } = position.coords;
    const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
    if (!mapTilerKey) return { lat, lng, address: "Current device location" };

    const response = await fetch(`https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${encodeURIComponent(mapTilerKey)}`);
    if (!response.ok) return { lat, lng, address: "Current device location" };
    const data = await response.json() as { features?: Array<{ place_name?: string; text?: string }> };
    return { lat, lng, address: data.features?.[0]?.place_name || data.features?.[0]?.text || "Current device location" };
  } catch {
    return null;
  }
}
