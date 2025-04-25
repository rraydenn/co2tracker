export interface CO2Coefficients {
  [key: string]: number;
  voiture: number;
  avion: number;
  bateau: number;
}

export function calculateCO2Emissions(
  distanceKm: number,
  transportMode: string,
  numberOfPeople: number
): number {
  // CO2 coefficients in kg per km per person
  const co2Coefficients: CO2Coefficients = {
    voiture: 0.2,
    avion: 0.3,
    bateau: 0.15
  };
  
  console.log("### Debug: CO2 calculation inputs:", {
    distanceKm,
    transportMode,
    coefficient: co2Coefficients[transportMode],
    numberOfPeople
  });

  const co2PerPerson = distanceKm * co2Coefficients[transportMode];
  const totalCO2 = co2PerPerson * numberOfPeople;
  
  console.log("### Debug: Calculated CO2:", totalCO2, "kg");
  return totalCO2;
}

export function calculateCO2BarWidth(totalCO2: number): number {
  // Simple scaling for visualization - can be adjusted 
  return Math.min(totalCO2 / 10, 100);
}