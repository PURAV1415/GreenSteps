import type { User, DailyData, LeaderboardUser, LeaderboardDepartment } from './types';

export const mockUser: User = {
  id: 'user-123',
  name: 'Alex Green',
  email: 'alex.green@university.edu',
  department: 'Computer Science',
  campus: 'Main Campus',
  totalPoints: 1250,
  totalEmissions: 45.2,
  dailyPoints: 15,
  dailyEmissions: 1.2,
  streak: 7,
  milestones: {
    walked: 120,
    cycled: 50,
  },
  todayTransportMode: 'Bicycle',
};

export const mockDailyHistory: DailyData[] = [
  { date: '2023-10-01', emissions: 2.5, points: 10 },
  { date: '2023-10-02', emissions: 0, points: 50 },
  { date: '2023-10-03', emissions: 1.2, points: 25 },
  { date: '2023-10-04', emissions: 3.1, points: 5 },
  { date: '2023-10-05', emissions: 0.5, points: 40 },
  { date: '2023-10-06', emissions: 0, points: 50 },
  { date: '2023-10-07', emissions: 1.2, points: 25 },
];

export const mockDepartmentLeaderboard: LeaderboardUser[] = [
  { rank: 1, name: 'Bobbie Draper', totalPoints: 1800, dailyPoints: 30, isCurrentUser: false },
  { rank: 2, name: 'Chrisjen Avasarala', totalPoints: 1650, dailyPoints: 20, isCurrentUser: false },
  { rank: 3, name: 'James Holden', totalPoints: 1400, dailyPoints: 18, isCurrentUser: false },
  { rank: 4, name: 'Alex Green', totalPoints: 1250, dailyPoints: 15, isCurrentUser: true },
  { rank: 5, name: 'Naomi Nagata', totalPoints: 1100, dailyPoints: 12, isCurrentUser: false },
];

export const mockCampusLeaderboard: LeaderboardDepartment[] = [
    { rank: 1, department: 'Engineering', totalPoints: 25000 },
    { rank: 2, department: 'Computer Science', totalPoints: 22500 },
    { rank: 3, department: 'Medicine', totalPoints: 19000 },
    { rank: 4, department: 'Business', totalPoints: 17500 },
    { rank: 5, department: 'Arts & Humanities', totalPoints: 15000 },
];
