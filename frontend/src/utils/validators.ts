//TODO: supprimer si inutilisé
/**
 * Validate email format
 * @param email Email to validate
 * @returns True if valid
 */
export const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

//TODO: supprimer si inutilisé
/**
 * Validate that text is not empty
 * @param value Text to validate
 * @returns True if not empty
 */
export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

//TODO: supprimer si inutilisé
/**
 * Validate minimum length
 * @param value Text to validate
 * @param length Minimum length
 * @returns True if valid
 */
export const validateMinLength = (value: string, length: number): boolean => {
  return value.length >= length;
};