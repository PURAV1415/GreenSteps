'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UpdateTransportDialog } from '@/components/update-transport-dialog';
import { EmissionsChart } from '@/components/emissions-chart';
import { PointsChart } from '@/components/points-chart';
import { ComparisonChart } from '@/components/comparison-chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

import { Flame, Star, Milestone, Bot, Trophy, Users, TrendingUp, Leaf, Route } from 'lucide-react';

import type { User, DailyData, LeaderboardUser, LeaderboardDepartment, TransportMode } from '@/lib/types';
import { mockUser, mockDailyHistory, mockDepartmentLeaderboard, mockCampusLeaderboard } from '@/lib/mock-data';
import { EMISSION_FACTORS } from '@/lib/constants';

import { fetchEcoRecommendations } from './actions';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [dailyHistory, setDailyHistory] = useState<DailyData[]>([]);
  const [departmentLeaderboard, setDepartmentLeaderboard] = useState<LeaderboardUser[]>([]);
  const [campusLeaderboard, setCampusLeaderboard] = useState<LeaderboardDepartment[]>([]);
  const [isUpdateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);

  useEffect(() => {
    setUser(mockUser);
    setDailyHistory(mockDailyHistory);
    setDepartmentLeaderboard(mockDepartmentLeaderboard);
    setCampusLeaderboard(mockCampusLeaderboard);
  }, []);

  const handleUpdateTransport = async (data: { mode: TransportMode, distance: number, trips: number }) => {
    if (!user) return;
    
    const emissionFactor = EMISSION_FACTORS[data.mode];
    const newDailyEmissions = data.distance * emissionFactor * data.trips;
    const newDailyPoints = Math.max(0, Math.round((1 / (newDailyEmissions + 0.1)) * 50));
    
    const updatedUser: User = {
      ...user,
      todayTransportMode: data.mode,
      dailyEmissions: parseFloat(newDailyEmissions.toFixed(2)),
      dailyPoints: newDailyPoints,
      totalEmissions: parseFloat((user.totalEmissions + newDailyEmissions).toFixed(2)),
      totalPoints: user.totalPoints + newDailyPoints,
    };
    setUser(updatedUser);

    const today = new Date().toISOString().split('T')[0];
    const existingEntryIndex = dailyHistory.findIndex(d => d.date === today);
    if (existingEntryIndex > -1) {
      const newHistory = [...dailyHistory];
      newHistory[existingEntryIndex] = { date: today, emissions: newDailyEmissions, points: newDailyPoints };
      setDailyHistory(newHistory);
    } else {
      setDailyHistory([...dailyHistory, { date: today, emissions: newDailyEmissions, points: newDailyPoints }]);
    }
    
    setUpdateDialogOpen(false);
    setIsLoadingRecs(true);
    try {
      const recs = await fetchEcoRecommendations({
        transportMode: data.mode,
        distanceTraveled: data.distance,
        numberOfTrips: data.trips,
        dailyEmissions: newDailyEmissions,
        totalPoints: updatedUser.totalPoints,
        dailyPoints: newDailyPoints,
      });
      setRecommendations(recs);
    } finally {
      setIsLoadingRecs(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">{user.name}</div>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground">{user.department}, {user.campus}</p>
            <div className="mt-4 flex items-center gap-2">
              <Route className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Today's Mode: <strong>{user.todayTransportMode || 'Not set'}</strong></span>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setUpdateDialogOpen(true)}>Update Today's Travel</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Emissions</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.dailyEmissions} kg CO₂</div>
            <p className="text-xs text-muted-foreground">Total: {user.totalEmissions} kg CO₂</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Points</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-foreground">{user.dailyPoints}</div>
            <p className="text-xs text-muted-foreground">Total: {user.totalPoints} points</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streaks & Milestones</CardTitle>
            <Milestone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex justify-around items-center">
            <div className="text-center">
              <div className="text-2xl font-bold">{user.streak}</div>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{user.milestones.walked} km</div>
              <p className="text-xs text-muted-foreground">Walked</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{user.milestones.cycled} km</div>
              <p className="text-xs text-muted-foreground">Cycled</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Personalized Suggestions</CardTitle>
            <CardDescription>AI-powered tips to reduce your footprint and earn more points.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {isLoadingRecs ? (
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5 animate-pulse" />
                <p className="text-sm text-muted-foreground">Generating new recommendations...</p>
              </div>
            ) : recommendations.length > 0 ? (
              recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-3 bg-accent/30 p-3 rounded-lg">
                  <Bot className="h-5 w-5 text-accent-foreground mt-1" />
                  <p className="text-sm text-accent-foreground">{rec}</p>
                </div>
              ))
            ) : (
               <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Update your daily travel to get new suggestions.</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
           <CardHeader>
            <CardTitle>Daily Points</CardTitle>
             <CardDescription>Points earned over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <PointsChart data={dailyHistory} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 xl:col-span-3">
          <CardHeader>
            <CardTitle>Leaderboards</CardTitle>
            <CardDescription>See how you stack up against others.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="department">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="department"><Users className="mr-2 h-4 w-4" />Department</TabsTrigger>
                <TabsTrigger value="campus"><Trophy className="mr-2 h-4 w-4"/>Campus</TabsTrigger>
              </TabsList>
              <TabsContent value="department">
                 <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Total Points</TableHead>
                      <TableHead className="text-right">Daily Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departmentLeaderboard.map((u) => (
                      <TableRow key={u.rank} className={u.isCurrentUser ? 'bg-accent/50' : ''}>
                        <TableCell className="font-medium">{u.rank}</TableCell>
                        <TableCell>{u.name} {u.isCurrentUser && "(You)"}</TableCell>
                        <TableCell className="text-right">{u.totalPoints}</TableCell>
                        <TableCell className="text-right">{u.dailyPoints}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="campus">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-right">Total Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campusLeaderboard.map((d) => (
                      <TableRow key={d.rank} className={d.department === user.department ? 'bg-accent/50' : ''}>
                        <TableCell className="font-medium">{d.rank}</TableCell>
                        <TableCell>{d.department}</TableCell>
                        <TableCell className="text-right">{d.totalPoints}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 xl:col-span-2">
           <CardHeader>
            <CardTitle>Daily Emissions</CardTitle>
            <CardDescription>Your CO₂ emissions over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <EmissionsChart data={dailyHistory} />
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-1 xl:col-span-1">
           <CardHeader>
            <CardTitle>Emission Forecast</CardTitle>
            <CardDescription>Potential points based on your habits.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium">Use EV Tomorrow</p>
                    <p className="text-xs text-muted-foreground">vs. your usual car ride</p>
                </div>
                <Badge variant="outline" className="text-primary border-primary">+50 Points</Badge>
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium">Cycle for 3 days</p>
                    <p className="text-xs text-muted-foreground">Short distance trips</p>
                </div>
                <Badge variant="outline" className="text-primary border-primary">+150 Points</Badge>
            </div>
             <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium">Walk to Campus</p>
                    <p className="text-xs text-muted-foreground">If you live nearby</p>
                </div>
                <Badge variant="outline" className="text-primary border-primary">+75 Points</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 xl:col-span-3">
          <CardHeader>
            <CardTitle>Performance Comparison</CardTitle>
            <CardDescription>Your emissions vs. department and campus averages.</CardDescription>
          </CardHeader>
          <CardContent>
            <ComparisonChart personal={user.dailyEmissions} />
          </CardContent>
        </Card>

      </div>
      <UpdateTransportDialog
        isOpen={isUpdateDialogOpen}
        setIsOpen={setUpdateDialogOpen}
        onSubmit={handleUpdateTransport}
      />
    </>
  );
}
