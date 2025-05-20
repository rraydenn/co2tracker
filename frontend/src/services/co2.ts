import { log } from "@/utils/logger";

export interface Transport {
  id: number;
  name: string;
  co2_per_km: number;
  average_speed: number;
}

export async function fetchTransports(): Promise<Transport[]> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const response = await fetch(`${API_BASE_URL}/transports`);
  if (!response.ok) {
    throw new Error('Failed to fetch transports');
  }
  const data = await response.json();
  log("Fetched transports:", 'debug', data);
  return data as Transport[];
}

export function calculateCO2Emissions(
  distanceKm: number,
  transportMode: string,
  numberOfPeople: number,
  transports: Transport[]
): number {
  const transport = transports.find(t => t.name.toLowerCase() === transportMode.toLowerCase());
  if (!transport) {
    throw new Error(`Transport mode "${transportMode}" not found`);
  }
  
  log("CO2 calculation inputs:", 'debug', {
    distanceKm,
    transportMode,
    coefficient: transport.co2_per_km,
    numberOfPeople
  });

  const co2PerPerson = distanceKm * transport.co2_per_km;
  const totalCO2 = co2PerPerson * numberOfPeople;
  
  log("Calculated CO2", 'debug', totalCO2, "kg");
  return totalCO2;
}

export function calculateCO2BarWidth(totalCO2: number): number {
  // Simple scaling for visualization - can be adjusted 
  return Math.min(totalCO2 / 10, 100);
}