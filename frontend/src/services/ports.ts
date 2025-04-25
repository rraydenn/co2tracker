import L from 'leaflet';

/**
 * Find nearest port to a given coordinate
 * @param lat Latitude
 * @param lng Longitude
 * @returns Nearest port information
 */
export const findNearestPort = async (lat: number, lng: number) => {
  try {
    // Query to find ports within 50km using Overpass API
    const query = `
      [out:json];
      node["harbour"="yes"](around:50000,${lat},${lng});
      out;
    `;
    
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query
    });
    
    if (!response.ok) {
      throw new Error(`Overpass API failed with status ${response.status}`);
    }
    
    const data = await response.json();
    const ports = data.elements.map((port: any) => ({
      name: port.tags?.name || 'Unknown Port',
      lat: port.lat,
      lon: port.lon
    }));
    
    if (ports.length === 0) {
      console.log("No ports found within 50 km");
      return null;
    }
    
    // Calculate the distance of each port from the given point
    let nearestPort = { name: 'null', lat: 0, lon: 0 };
    let minDistance = Infinity;
    
    ports.forEach((port: { name: string, lat: number, lon: number }) => {
      const distancePort = calculateDistance(lat, lng, port.lat, port.lon);
      if (distancePort < minDistance) {
        minDistance = distancePort;
        nearestPort = { name: port.name, lat: port.lat, lon: port.lon };
      }
    });
    
    return nearestPort;
  } catch (error) {
    console.error("Error finding nearest port:", error);
    return null;
  }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;
  
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c; // Distance in meters
};