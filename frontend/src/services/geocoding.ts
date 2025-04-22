// geocoding.ts
import { ref } from 'vue';

interface AutocompleteResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  length: number;
}

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
