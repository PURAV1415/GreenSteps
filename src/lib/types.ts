export type TransportMode = 'Car' | 'Bike' | 'Bus' | 'Walking' | 'Bicycle' | 'EV';

export type User = {
  id: string;
  name: string;
  email: string;
  department: string;
  campus: string;
  totalPoints: number;
  totalEmissions: number;
  streak: number;
  milestones: {
    walked: number;
    cycled: number;
  };
};

export type DailyData = {
  date: string; // YYYY-MM-DD
  emissions: number;
  points: number;
  mode: TransportMode;
  distance: number;
  trips: number;
};

export type LeaderboardUser = {
  id: string;
  rank: number;
  name: string;
  totalPoints: number;
  dailyPoints: number;
  isCurrentUser: boolean;
  department: string;
  campus: string;
};

export type LeaderboardDepartment = {
  rank: number;
  department: string;
  totalPoints: number;
};
