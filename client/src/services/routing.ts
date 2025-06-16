import L from 'leaflet';
import { Port } from '@/types/trip';
import { log } from '@/utils/logger';

export async function fetchRoute(
  start: L.LatLng, 
  end: L.LatLng, 
  profile: string,
  baseUrl: string,
  apiKey: string
): Promise<any> {
  const url = `${baseUrl}/v2/directions/${profile}?api_key=${apiKey}&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`;
  log("Sending OSRM route request to:", 'debug', url);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`OSRM request failed with status ${response.status}`);
  }
  
  return response.json();
}

export function calculateDirectDistance(start: L.LatLng, end: L.LatLng): number {
  return start.distanceTo(end);
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Radius of the Earth in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export async function findNearestPort(startLat: number, startLng: number): Promise<Port | null> {
  const OVERPASS_BASE_URL = import.meta.env.VITE_OVERPASS_BASE_URL;
  const overpassUrl = `${OVERPASS_BASE_URL}/api/interpreter`;
  const query = `
    [out:json];
    node["seamark:type"="harbour"](around:50000,${startLat},${startLng});
    out body;
  `;

  try {
    const response = await fetch(overpassUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `data=${encodeURIComponent(query)}`
    });

    if (!response.ok) {
      throw new Error(`Overpass API request failed with status ${response.status}`);
    }

    const data = await response.json();
    log("Overpass API response:", 'debug', data);
    const ports = data.elements.map((port: { tags: { name?: string }; lat: number; lon: number }) => ({
      name: port.tags.name || 'Unknown Port',
      lat: port.lat,
      lon: port.lon
    }));
    
    log("Ports found:", 'debug', ports);
    if (ports.length === 0) {
      log("No ports found within 50 km", 'debug');
      return null;
    }

    // Calculate distance to each port
    let nearestPort: Port = { name: 'null', lat: 999999, lon: 9999999 };
    let minDistance = Infinity;

    ports.forEach((port: Port) => {
      const distancePort = calculateDistance(startLat, startLng, port.lat, port.lon);
      if (distancePort < minDistance) {
        minDistance = distancePort;
        nearestPort = { name: port.name, lat: port.lat, lon: port.lon };
      }
    });

    if (nearestPort.name !== 'null') {
      log("Nearest port found:", 'debug', nearestPort);
      log(`Distance to nearest port: ${(minDistance / 1000).toFixed(2)} km`, 'debug');
    } else {
      log("No nearest port found", 'debug');
    }

    return nearestPort;
  } catch (error) {
    console.error("Error retrieving ports:", error);
    return null;
  }
}