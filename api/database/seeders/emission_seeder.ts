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
          name: "Vélo à assistance électrique",
          co2_per_km: 0.11,
          average_speed: 20
        }, 
        {
          name: "Covoiturage électrique",
          co2_per_km: 0.52,
          average_speed: 51
        },
        {
          name: "Covoiturage thermique",
          co2_per_km: 1.09,
          average_speed: 51
        },
        {
          name: "Moto thermique",
          co2_per_km: 1.91,
          average_speed: 43
        },
        {
          name: "Voiture électrique",
          co2_per_km: 1.03,
          average_speed: 51
        },
        {
          name: "Voiture thermique",
          co2_per_km: 2.18,
          average_speed: 51
        },
        {
          name: "Bus thermique",
          co2_per_km: 1.1,
          average_speed: 35
        }, 
        {
          name: "Avion court courrier",
          co2_per_km: 2.59,
          average_speed: 850
        }
      ])
  }
}