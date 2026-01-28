import type { TransportMode } from './types';

export const EMISSION_FACTORS: Record<TransportMode, number> = {
  'Car': 0.23,
  'Bike': 0.11, // Motorcycle
  'Bus': 0.05,
  'EV': 0.05,
  'Walking': 0,
  'Bicycle': 0,
};

export const TRANSPORT_MODES: TransportMode[] = ['Car', 'Bike', 'Bus', 'Walking', 'Bicycle', 'EV'];

export const DEPARTMENTS = ["Computer Science", "Business", "Arts & Humanities", "Engineering", "Medicine"];
export const CAMPUSES = ["Main Campus", "South Campus", "Online", "North Campus"];
