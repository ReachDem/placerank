/**
 * Utilities for phone number formatting and validation for Cameroon
 */

/**
 * Normalize Cameroon phone number to international format (+237xxxxxxxx)
 * @param phoneNumber - Raw phone number input
 * @returns Normalized phone number in international format
 * @throws Error if phone number format is invalid
 */
export function normalizeCameroonPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) {
    throw new Error('Numéro de téléphone requis');
  }

  // Remove any spaces, dashes, parentheses, and other non-digit characters except +
  let cleaned = phoneNumber.replace(/[\s\-\(\)\.]/g, '');
  
  // Handle different Cameroon number formats
  if (cleaned.startsWith('+237')) {
    // Already properly formatted (+237xxxxxxxx)
    if (cleaned.length !== 12) {
      throw new Error('Numéro camerounais invalide. Format attendu: +237xxxxxxxx');
    }
    return cleaned;
  } else if (cleaned.startsWith('237')) {
    // Has country code without + (237xxxxxxxx)
    if (cleaned.length !== 11) {
      throw new Error('Numéro camerounais invalide. Format attendu: 237xxxxxxxx');
    }
    return '+' + cleaned;
  } else if (cleaned.startsWith('6') || cleaned.startsWith('2')) {
    // Local Cameroon number (6xxxxxxxx or 2xxxxxxxx)
    if (cleaned.length !== 9) {
      throw new Error('Numéro camerounais invalide. Format attendu: 6xxxxxxxx ou 2xxxxxxxx');
    }
    return '+237' + cleaned;
  } else {
    throw new Error('Format de numéro invalide pour le Cameroun. Formats acceptés: +237xxxxxxxx, 237xxxxxxxx, 6xxxxxxxx, 2xxxxxxxx');
  }
}

/**
 * Validate if a phone number is a valid Cameroon format
 * @param phoneNumber - Phone number to validate
 * @returns Boolean indicating if the number is valid
 */
export function isValidCameroonPhoneNumber(phoneNumber: string): boolean {
  try {
    normalizeCameroonPhoneNumber(phoneNumber);
    return true;
  } catch {
    return false;
  }
}

/**
 * Format phone number for display (with spaces for readability)
 * @param phoneNumber - Normalized phone number
 * @returns Formatted phone number for display
 */
export function formatPhoneNumberForDisplay(phoneNumber: string): string {
  const normalized = normalizeCameroonPhoneNumber(phoneNumber);
  // Format: +237 6XX XX XX XX
  return normalized.replace(/(\+237)(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2$3 $4 $5 $6');
}

/**
 * Get phone number type (mobile or landline)
 * @param phoneNumber - Normalized phone number
 * @returns Phone number type
 */
export function getPhoneNumberType(phoneNumber: string): 'mobile' | 'landline' | 'unknown' {
  const normalized = normalizeCameroonPhoneNumber(phoneNumber);
  const localNumber = normalized.slice(4); // Remove +237
  
  if (localNumber.startsWith('6')) {
    return 'mobile';
  } else if (localNumber.startsWith('2')) {
    return 'landline';
  } else {
    return 'unknown';
  }
}
