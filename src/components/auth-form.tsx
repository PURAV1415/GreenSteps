'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Leaf, Mail, Lock, User, Building, MapPin, Bike, Bus, Car, Zap, Footprints } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DEPARTMENTS, CAMPUSES, TRANSPORT_MODES, EMISSION_FACTORS } from '@/lib/constants';
import { useAuth, useFirestore, initiateEmailSignIn, setDocumentNonBlocking } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import type { TransportMode } from '@/lib/types';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Please enter your password.' }),
});

const signupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  department: z.string().min(1, { message: 'Please select a department.' }),
  campus: z.string().min(1, { message: 'Please select a campus.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});

const transportSchema = z.object({
  mode: z.string().min(1, { message: 'Please select a transport mode.' }),
  distance: z.coerce.number().min(0, { message: 'Distance cannot be negative.' }),
  trips: z.coerce.number().min(1, { message: 'At least one trip is required.' }),
});

export function AuthForm() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isTransportDialogOpen, setIsTransportDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signupData, setSignupData] = useState<z.infer<typeof signupSchema> | null>(null);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '', department: '', campus: '' },
  });
  
  const transportForm = useForm<z.infer<typeof transportSchema>>({
    resolver: zodResolver(transportSchema),
    defaultValues: { mode: 'Walking', distance: 1, trips: 1 },
  });

  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    initiateEmailSignIn(auth, values.email, values.password);
    router.push('/dashboard');
  };

  const onSignupSubmit = (values: z.infer<typeof signupSchema>) => {
    setSignupData(values);
    setIsTransportDialogOpen(true);
  };
  
  const onTransportSubmit = async (transportValues: z.infer<typeof transportSchema>) => {
    if (!signupData) return;
    setIsLoading(true);

    try {
      // 1. Create user
      const userCredential = await createUserWithEmailAndPassword(auth, signupData.email, signupData.password);
      const user = userCredential.user;

      // 2. Calculate initial daily data
      const emissionFactor = EMISSION_FACTORS[transportValues.mode as TransportMode];
      const initialDailyEmissions = transportValues.distance * emissionFactor * transportValues.trips;
      const initialDailyPoints = Math.max(0, Math.round((1 / (initialDailyEmissions + 0.1)) * 50));
      const today = new Date().toISOString().split('T')[0];

      // 3. Create user document
      const userRef = doc(firestore, 'users', user.uid);
      const newUserDoc = {
          id: user.uid,
          name: signupData.name,
          email: signupData.email,
          department: signupData.department,
          campus: signupData.campus,
          totalPoints: initialDailyPoints,
          totalEmissions: parseFloat(initialDailyEmissions.toFixed(2)),
          streak: 0,
          milestones: { walked: 0, cycled: 0 },
      };
      setDocumentNonBlocking(userRef, newUserDoc, {});

      // 4. Create first daily data document
      const dailyDataRef = doc(firestore, 'users', user.uid, 'dailyData', today);
      const newDailyData = {
          userId: user.uid,
          date: today,
          mode: transportValues.mode,
          distance: transportValues.distance,
          trips: transportValues.trips,
          emissions: initialDailyEmissions,
          points: initialDailyPoints,
      };
      setDocumentNonBlocking(dailyDataRef, newDailyData, {});
      
      // 5. Create leaderboard entry
      const leaderboardRef = doc(firestore, 'leaderboard', user.uid);
      const newLeaderboardEntry = {
        id: user.uid,
        userId: user.uid,
        name: signupData.name,
        department: signupData.department,
        campus: signupData.campus,
        totalPoints: initialDailyPoints,
        dailyPoints: initialDailyPoints,
      };
      setDocumentNonBlocking(leaderboardRef, newLeaderboardEntry, {});

      // 6. Navigate
      setIsTransportDialogOpen(false);
      router.push('/dashboard');

    } catch (error: any) {
       if (error.code === 'auth/operation-not-allowed') {
        toast({
          variant: 'destructive',
          title: 'Operation Not Allowed',
          description:
            'Email/Password sign-in is not enabled. Please enable it in the Firebase console.',
        });
      } else {
        console.error("Signup Error:", error);
        toast({
          variant: "destructive",
          title: "Signup Failed",
          description: error.message || "An unexpected error occurred.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  const transportIcons: { [key: string]: React.ElementType } = {
    Car: Car, Bike: Bike, Bus: Bus, Walking: Footprints, Bicycle: Bike, EV: Zap
  };

  return (
    <>
      <div className="grid gap-2 text-center">
        <div className="flex items-center justify-center gap-2">
          <Leaf className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold font-headline">GreenSteps</h1>
        </div>
        <p className="text-balance text-muted-foreground">
          Join the movement. Track your carbon footprint.
        </p>
      </div>

      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="grid gap-4">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="name@university.edu" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="password" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Login</Button>
            </form>
          </Form>
        </TabsContent>
        <TabsContent value="signup">
          <Form {...signupForm}>
            <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="grid gap-4">
              <FormField
                control={signupForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Alex Green" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signupForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="name@university.edu" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={signupForm.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <SelectTrigger className="pl-10"><SelectValue placeholder="Select your department" /></SelectTrigger>
                        </div>
                      </FormControl>
                      <SelectContent>
                        {DEPARTMENTS.map(dep => <SelectItem key={dep} value={dep}>{dep}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={signupForm.control}
                name="campus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campus</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                         <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <SelectTrigger className="pl-10"><SelectValue placeholder="Select your campus" /></SelectTrigger>
                        </div>
                      </FormControl>
                      <SelectContent>
                        {CAMPUSES.map(cam => <SelectItem key={cam} value={cam}>{cam}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signupForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="password" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Create account</Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
      
      <Dialog open={isTransportDialogOpen} onOpenChange={setIsTransportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Initial Transport Info</DialogTitle>
            <DialogDescription>
              Help us understand your current travel habits to get you started.
            </DialogDescription>
          </DialogHeader>
           <Form {...transportForm}>
            <form onSubmit={transportForm.handleSubmit(onTransportSubmit)} className="grid gap-4 py-4">
              <FormField
                  control={transportForm.control}
                  name="mode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Mode of Transport</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                           <SelectTrigger>
                            <SelectValue placeholder="Select a mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TRANSPORT_MODES.map(mode => {
                            const Icon = transportIcons[mode];
                            return (
                              <SelectItem key={mode} value={mode}>
                                <div className="flex items-center gap-2">
                                  {Icon && <Icon className="h-4 w-4" />}
                                  {mode}
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={transportForm.control}
                  name="distance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average one-way distance (km)</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 10" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={transportForm.control}
                  name="trips"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of round trips per day</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 1" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <DialogFooter>
                <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {isLoading ? 'Saving...' : 'Save and Continue'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
