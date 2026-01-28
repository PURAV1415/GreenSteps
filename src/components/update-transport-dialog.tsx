'use client';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Car, Bike, Bus, Footprints, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TRANSPORT_MODES } from '@/lib/constants';
import type { TransportMode } from '@/lib/types';

const transportSchema = z.object({
  mode: z.custom<TransportMode>(val => TRANSPORT_MODES.includes(val as TransportMode), {
    message: "Please select a valid transport mode.",
  }),
  distance: z.coerce.number().min(0, { message: 'Distance must be a positive number.' }),
  trips: z.coerce.number().int().min(1, { message: 'Must have at least one trip.' }),
});

type UpdateTransportDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSubmit: (values: z.infer<typeof transportSchema>) => void;
};

const transportIcons: { [key in TransportMode]: React.ElementType } = {
  Car: Car,
  Bike: Bike,
  Bus: Bus,
  Walking: Footprints,
  Bicycle: Bike,
  EV: Zap,
};

export function UpdateTransportDialog({ isOpen, setIsOpen, onSubmit }: UpdateTransportDialogProps) {
  const form = useForm<z.infer<typeof transportSchema>>({
    resolver: zodResolver(transportSchema),
    defaultValues: {
      distance: 0,
      trips: 1,
    },
  });

  const handleFormSubmit = (values: z.infer<typeof transportSchema>) => {
    onSubmit(values);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Daily Transport</DialogTitle>
          <DialogDescription>
            Log your travel for today to update your carbon footprint and earn points.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mode of transport</FormLabel>
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
                              {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                              <span>{mode}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="distance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Distance traveled (km)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 5.5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="trips"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of trips</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">Log Travel</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
