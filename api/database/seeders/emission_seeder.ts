import Transport from '#models/transport'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
      await Transport.createMany([
        {
          name: "Vélo mécanique",
          co2_per_km: 0,
          average_speed: 15
        }, 
        {
          name: "Covoiturage",
          co2_per_km: 0.52,
          average_speed: 51
        },
        {
          name: "Moto",
          co2_per_km: 0.19,
          average_speed: 43
        },
        {
          name: "Voiture électrique",
          co2_per_km: 0.10,
          average_speed: 51
        },
        {
          name: "Voiture thermique",
          co2_per_km: 0.20,
          average_speed: 51
        },
        {
          name: "Bus",
          co2_per_km: 0.17,
          average_speed: 39
        }, 
        {
          name: "Avion",
          co2_per_km: 0.27,
          average_speed: 850
        },
        {
          name: "Bateau",
          co2_per_km: 0.3,
          average_speed: 40
        }
      ])
  }
}