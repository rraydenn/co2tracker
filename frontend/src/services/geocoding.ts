import { AutocompleteResult } from '@/types/map';

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
  const NOMINATIM_BASE_URL = import.meta.env.VITE_NOMINATIM_BASE_URL;
  const url = `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(query)}`;
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