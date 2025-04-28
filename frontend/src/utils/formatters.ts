/**
 * Formats a date string into a localized date representation
 * @param dateString - Date string to format
 * @returns Formatted date string
 */
export function formatDate(dateString: string | null): string {
  if (!dateString) return 'Date non disponible';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date invalide';
  }
};
  
/**
 * Formats a CO2 value with appropriate units
 * @param value - CO2 value in kg
 * @returns Formatted CO2 string with units
 */
export function formatCO2(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0 kg';
  
  if (numValue < 1) {
    return `${(numValue * 1000).toFixed(0)} g`;
  }
  
  return `${numValue.toFixed(2)} kg`;
};

//TODO: supprimer si inutilisé
/**
 * Format distance with unit
 * @param value Distance in km
 * @returns Formatted distance string
 */
export const formatDistance = (value: number): string => {
  return `${value.toFixed(2)} km`;
};