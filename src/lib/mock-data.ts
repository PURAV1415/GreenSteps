import type { User, DailyData, LeaderboardUser, LeaderboardDepartment } from './types';

// Mock data is no longer used, but the file is kept to avoid breaking imports.
// The dashboard now fetches live data from Firestore.

export const mockUser: User = {} as User;

export const mockDailyHistory: DailyData[] = [];

export const mockDepartmentLeaderboard: LeaderboardUser[] = [];

export const mockCampusLeaderboard: LeaderboardDepartment[] = [];
