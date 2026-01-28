import type { User, DailyData, LeaderboardUser, LeaderboardDepartment } from './types';

export const mockUser: User = {
  id: 'user-123',
  name: 'New User',
  email: 'new.user@university.edu',
  department: 'Computer Science',
  campus: 'Main Campus',
  totalPoints: 0,
  totalEmissions: 0,
  dailyPoints: 0,
  dailyEmissions: 0,
  streak: 0,
  milestones: {
    walked: 0,
    cycled: 0,
  },
  todayTransportMode: null,
};

export const mockDailyHistory: DailyData[] = [];

export const mockDepartmentLeaderboard: LeaderboardUser[] = [
  { rank: 1, name: 'New User', totalPoints: 0, dailyPoints: 0, isCurrentUser: true },
];

export const mockCampusLeaderboard: LeaderboardDepartment[] = [
    { rank: 1, department: 'Computer Science', totalPoints: 0 },
];
