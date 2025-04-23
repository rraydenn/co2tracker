/**
 * Format a date to local date string
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string | null): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR');
};
  
/**
 * Format CO2 value with unit
 * @param value CO2 value in kg
 * @returns Formatted CO2 string
 */
export const formatCO2 = (value: number): string => {
  return `${value.toFixed(2)} kg CO2`;
};

/**
 * Format distance with unit
 * @param value Distance in km
 * @returns Formatted distance string
 */
export const formatDistance = (value: number): string => {
  return `${value.toFixed(2)} km`;
};