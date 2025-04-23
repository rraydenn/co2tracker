import L from 'leaflet';

/**
 * Fetch a route between two points from OSRM
 * @param start Start coordinates
 * @param end End coordinates
 * @param profile Routing profile (driving, cycling, etc)
 * @returns Route data
 */
export const fetchRoute = async (start: L.LatLng, end: L.LatLng, profile = 'driving-car') => {
  // Use environment variables for API keys
  const OSRM_BASE_URL = import.meta.env.VITE_OSRM_BASE_URL;
  const OSRM_API_KEY = import.meta.env.VITE_OSRM_API_KEY;
  
  const url = `${OSRM_BASE_URL}/v2/directions/${profile}?api_key=${OSRM_API_KEY}&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Route calculation failed with status: ${response.status}`);
  }
  
  return await response.json();
};