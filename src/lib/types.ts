export type TransportMode = 'Car' | 'Bike' | 'Bus' | 'Walking' | 'Bicycle' | 'EV';

export type User = {
  id: string;
  name: string;
  email: string;
  department: string;
  campus: string;
  totalPoints: number;
  totalEmissions: number;
  dailyPoints: number;
  dailyEmissions: number;
  streak: number;
  milestones: {
    walked: number;
    cycled: number;
  };
  todayTransportMode: TransportMode | null;
};

export type DailyData = {
  date: string; // YYYY-MM-DD
  emissions: number;
  points: number;
};

export type LeaderboardUser = {
  rank: number;
  name: string;
  totalPoints: number;
  dailyPoints: number;
  isCurrentUser: boolean;
};

export type LeaderboardDepartment = {
  rank: number;
  department: string;
  totalPoints: number;
};
