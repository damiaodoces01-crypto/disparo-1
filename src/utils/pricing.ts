import { PricingRules } from "../types";

/**
 * Calculates delivery price automatically based on distance (km) and configured pricing rules.
 */
export function calculateDeliveryPrice(
  kmStr: string,
  rules: PricingRules
): string {
  if (!rules.enabled) return "";
  
  // Normalize comma decimal separator to dot
  const normalizedKm = kmStr.trim().replace(",", ".");
  const km = parseFloat(normalizedKm);
  
  if (isNaN(km) || km <= 0) return "";
  
  // Rule calculation: Base Fee + (Rate per KM * KM)
  const calculated = rules.baseFee + (rules.ratePerKm * km);
  
  // Guarantee the minimum fee is met
  const finalPrice = Math.max(rules.minFee, calculated);
  
  // Format to standard Brazil decimal representation (e.g., 18,50)
  return finalPrice.toFixed(2).replace(".", ",");
}
