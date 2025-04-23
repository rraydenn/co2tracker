/**
 * Calculate CO2 emissions for a trip
 * @param distance Distance in kilometers
 * @param transport Transport type
 * @param people Number of people
 * @returns CO2 emissions in kg
 */
export const calculateCO2 = (distance: number, transport: string, people: number = 1) => {
    // CO2 coefficients by transport type (kg per km)
    const co2Coefficients: Record<string, number> = {
      voiture: 0.2,
      bus: 0.1,
      train: 0.05,
      avion: 0.3,
      bateau: 0.4
    };
  
    const coefficient = co2Coefficients[transport] || co2Coefficients.voiture;
    const co2PerPerson = distance * coefficient;
    const totalCO2 = co2PerPerson * people;
    
    return {
      totalCO2,
      co2PerPerson,
      co2BarWidth: Math.min(totalCO2 / 10, 100) // For visualization
    };
  };