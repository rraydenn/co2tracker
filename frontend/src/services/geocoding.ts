import { ref } from 'vue';
import { AutocompleteResult } from '@/types/map';


// Fonction pour effectuer une recherche d'adresse (géocodage)
export const getGeocodingResults = async (query: string): Promise<AutocompleteResult[]> => {
    const API_KEY = import.meta.env.VITE_OSRM_API_KEY;
    const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5&key=${API_KEY}`;

  try {
    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new Error(`Geocoding API failed: ${response.status}`);
    }
    const data = await response.json();
    
    return data.map((result: any) => ({
      place_id: result.place_id,
      display_name: result.display_name,
      lat: result.lat,
      lon: result.lon,
      length: result.display_name.length,
    }));
  } catch (error) {
    console.error("### Debug: Geocoding error", error);
    return [];
  }
};

// Fonction pour rechercher des résultats d'autocomplétion pour le départ ou l'arrivée
export const fetchAutocompleteResults = async (query: string): Promise<AutocompleteResult[]> => {
  if (!query.trim()) return [];

  // Appel à l'API de géocodage pour obtenir les suggestions
  return await getGeocodingResults(query);
};

export function reverseGeocode(
  latlng: L.LatLng, 
  onSuccess: (address: string) => void
): void {
  const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json`;
  console.log(`### Debug: Sending reverse geocoding request to:`, nominatimUrl);

  fetch(nominatimUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Nominatim request failed with status ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log(`### Debug: Reverse geocoding result:`, data);
      const address = data.display_name;
      onSuccess(address);
    })
    .catch(error => {
      console.error('### Debug: Error during reverse geocoding:', error);
    });
}

export function searchLocation(
  query: string, 
  onSuccess: (results: AutocompleteResult[]) => void
): void {
  if (query.length < 3) {
    console.log("### Debug: Query too short, not searching");
    onSuccess([]);
    return;
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
  console.log("### Debug: Sending search request to Nominatim:", url);

  fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log("### Debug: Received search results:", data.length, "items");
      onSuccess(data);
    })
    .catch(error => {
      console.error('### Debug: Error fetching location suggestions:', error);
      onSuccess([]);
    });
}