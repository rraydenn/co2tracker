export interface User {
  full_name: string;
  email: string;
  password: string;
}

export interface UserData {
  id: number | null;
  full_name: string;
  email: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface UserStats {
  totalTrips: number;
  totalCO2: string;
  ranking: string;
}
